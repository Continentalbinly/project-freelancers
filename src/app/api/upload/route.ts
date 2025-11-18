import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { uploadToCloudinary } from "@/service/cloudinary";

const MAX_SIZE_MB = 2000; // ✅ up to 2 GB
const AUTH_KEY = process.env.NEXT_UPLOAD_KEY || "my_secure_upload_token";

/** 🔹 Main Upload Route */
export async function POST(request: NextRequest) {
  try {
    // ✅ Authorization check (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
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
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin || "";
    const fileUrl = `${baseUrl}/uploads/${folderType}${
      subfolder ? `/${subfolder}` : ""
    }/${fileName}`;

    // ✅ Optional backup to Cloudinary (non-blocking)
    uploadToCloudinary(buffer, fileName, file.type, folderType, subfolder)
      .then((res) =>
        console.log(`☁️ Cloudinary backup success: ${res.secure_url}`)
      )
      .catch((err) =>
        console.warn("⚠️ Cloudinary backup failed:", err.message)
      );

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
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unexpected upload failure",
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
    const localUrl = `/uploads/${folderType}/${fileName}`;

    // Backup to Cloudinary
    uploadToCloudinary(buffer, fileName, file.type, folderType).catch((err) =>
      console.error("Backup upload to Cloudinary failed:", err)
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
  } catch (error) {
    console.error("Local profile upload failed:", error);
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
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
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
