import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { uploadToCloudinary } from "@/service/cloudinary";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

const MAX_SIZE_MB = 2000; // ✅ up to 2 GB
// Support both server-side and client-side env var names
const AUTH_KEY = process.env.NEXT_UPLOAD_KEY || process.env.NEXT_PUBLIC_UPLOAD_KEY || "my_secure_upload_token";

// Initialize Firebase Admin for auth token verification
let adminAuth: ReturnType<typeof getAuth> | null = null;
try {
  if (!getApps().length && process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  if (getApps().length) {
    adminAuth = getAuth();
  }
} catch {
  // Firebase Admin not available, will use upload key only
  console.warn("Firebase Admin not initialized for upload route");
}

/** 🔹 Main Upload Route */
export async function POST(request: NextRequest) {
  try {
    // ✅ Authorization check - accept Firebase auth token OR upload key
    const authHeader = request.headers.get("authorization");
    let isAuthorized = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      
      // Check if it's the upload key
      if (token === AUTH_KEY) {
        isAuthorized = true;
      } 
      // Check if it's a Firebase auth token (for authenticated users)
      else if (adminAuth) {
        try {
          await adminAuth.verifyIdToken(token);
          isAuthorized = true;
        } catch {
          // Not a valid Firebase token, continue to check upload key
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized upload request" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderType = (formData.get("folderType") as string) || "general";
    const subfolder = (formData.get("subfolder") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Max allowed is ${MAX_SIZE_MB}MB.`,
        },
        { status: 400 }
      );
    }

    // Convert to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^\w.\-()]/g, "_");
    const fileName = `${folderType}-${timestamp}-${safeName}`;

    // 🔹 CASE 1 — profileImage (old logic)
    if (folderType === "profileImage") {
      return await handleProfileUpload(buffer, file, fileName, folderType);
    }

    // 🔹 CASE 2 — proposalsImage (Cloudinary direct)
    if (folderType === "proposalsImage") {
      return await handleCloudinaryUpload(
        buffer,
        file,
        fileName,
        folderType,
        subfolder
      );
    }

    // 🔹 CASE 2.5 — portfolio (Cloudinary direct for better image/video handling)
    if (folderType === "portfolio") {
      return await handleCloudinaryUpload(
        buffer,
        file,
        fileName,
        folderType,
        subfolder
      );
    }

    // 🔹 CASE 3 — large files (projectFiles / previews / etc.)
    const uploadsDir = join(
      process.cwd(),
      "public",
      "uploads",
      folderType,
      subfolder
    );
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    // Return relative path only - frontend will construct full URL
    const fileUrl = `/uploads/${folderType}${
      subfolder ? `/${subfolder}` : ""
    }/${fileName}`;

    // ✅ Optional backup to Cloudinary (non-blocking)
    uploadToCloudinary(buffer, fileName, file.type, folderType, subfolder)
      .then((res) => res)
      .catch((err) => err);

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storage: "local",
      },
    });
  } catch (err: unknown) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err instanceof Error ? err.message : String(err)) || "Unexpected upload failure",
      },
      { status: 500 }
    );
  }
}

/** 🔸 Helper: Handle profile image upload */
async function handleProfileUpload(
  buffer: Buffer,
  file: File,
  fileName: string,
  folderType: string
) {
  try {
    const uploadsDir = join(process.cwd(), "public", "uploads", folderType);
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    // Return relative path only - frontend will construct full URL
    const localUrl = `/uploads/${folderType}/${fileName}`;

    // Backup to Cloudinary
    uploadToCloudinary(buffer, fileName, file.type, folderType).catch(
      (err) => err
    );

    return NextResponse.json({
      success: true,
      data: {
        url: localUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storage: "local",
      },
    });
  } catch {
    // console.error("Local profile upload failed:", error);
    try {
      const result = await uploadToCloudinary(
        buffer,
        fileName,
        file.type,
        folderType
      );
      return NextResponse.json({
        success: true,
        data: {
          url: result.secure_url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storage: "cloudinary",
          cloudinaryId: result.public_id,
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to upload profile image" },
        { status: 500 }
      );
    }
  }
}

/** 🔸 Helper: Cloudinary-only upload (for proposals, etc.) */
async function handleCloudinaryUpload(
  buffer: Buffer,
  file: File,
  fileName: string,
  folderType: string,
  subfolder: string
) {
  try {
    const result = await uploadToCloudinary(
      buffer,
      fileName,
      file.type,
      folderType,
      subfolder
    );
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storage: "cloudinary",
        cloudinaryId: result.public_id,
      },
    });
  } catch  {
    // Silent fail
    return NextResponse.json(
      { success: false, error: "Failed to upload to Cloudinary" },
      { status: 500 }
    );
  }
}

export const config = {
  api: { bodyParser: false },
  maxDuration: 600,
};

// ✅ Allow CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
