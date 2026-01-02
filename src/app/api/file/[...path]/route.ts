import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve } from "path";
import { getAuth } from "firebase-admin/auth";
import { cert, getApps, initializeApp } from "firebase-admin/app";

export const runtime = "nodejs";

let adminAuth: ReturnType<typeof getAuth> | null = null;

function ensureAdminAuth() {
  if (adminAuth) return adminAuth;
  if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("Firebase Admin not configured");
    }
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }
  adminAuth = getAuth();
  return adminAuth;
}

function getContentType(extension: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    js: "application/javascript",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    css: "text/css",
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
  };
  return map[extension.toLowerCase()] || "application/octet-stream";
}

async function verifyToken(request: NextRequest) {
  const auth = ensureAdminAuth();
  const header = request.headers.get("authorization") || "";
  const queryToken = request.nextUrl.searchParams.get("token");
  const token = header.startsWith("Bearer ") ? header.split("Bearer ")[1] : queryToken;
  if (!token) {
    return { uid: null, error: "Missing token" } as const;
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid, error: null } as const;
  } catch {
    return { uid: null, error: "Invalid token" } as const;
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const segments = params.path || [];
    if (!segments.length) {
      return NextResponse.json({ success: false, error: "Missing path" }, { status: 400 });
    }

    const baseDir = resolve(process.cwd(), "storage", "uploads");
    const targetPath = resolve(baseDir, ...segments);

    if (!targetPath.startsWith(baseDir)) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 403 });
    }

    const isPrivate = segments[0] === "private";

    if (isPrivate) {
      const { uid, error } = await verifyToken(request);
      if (error || !uid) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const owner = segments[1];
      if (!owner || owner !== uid) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    if (!existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const buffer = await readFile(targetPath);
    const extension = segments[segments.length - 1]?.split(".").pop() || "";
    const contentType = getContentType(extension);

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "File retrieval failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
