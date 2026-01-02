import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve } from "path";
import { getAuth } from "firebase-admin/auth";
import { cert, getApps, initializeApp } from "firebase-admin/app";

export const runtime = "nodejs";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_EXTS = new Set([
  ...IMAGE_EXTS,
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

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

function sanitizeSegment(value: string, fallback: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || fallback;
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function getExtension(filename: string) {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase();
}

function buildPaths(uid: string, visibility: "private" | "public", folder: string, filename: string) {
  const parts = visibility === "public"
    ? ["public", folder, filename]
    : ["private", uid, folder, filename];
  const relativePath = parts.join("/");
  const absoluteDir = resolve(process.cwd(), "storage", "uploads", ...parts.slice(0, -1));
  const absoluteFile = resolve(absoluteDir, filename);
  const baseDir = resolve(process.cwd(), "storage", "uploads");
  if (!absoluteFile.startsWith(baseDir)) {
    throw new Error("Invalid path");
  }
  return { relativePath, absoluteDir, absoluteFile };
}

export async function POST(request: NextRequest) {
  try {
    const auth = ensureAdminAuth();

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing authorization token" }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await auth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid authorization token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderInput = (formData.get("folder") as string) || "misc";
    const visibilityInput = (formData.get("visibility") as string) || "private";

    if (!file) {
      return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
    }

    const ext = getExtension(file.name);
    if (!ALLOWED_EXTS.has(ext)) {
      return NextResponse.json({ success: false, error: "File type not allowed" }, { status: 400 });
    }

    const sizeLimit = IMAGE_EXTS.has(ext) ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
    if (file.size > sizeLimit) {
      const maxMb = Math.floor(sizeLimit / (1024 * 1024));
      return NextResponse.json({ success: false, error: `File too large. Max ${maxMb}MB.` }, { status: 400 });
    }

    const folder = sanitizeSegment(folderInput, "misc");
    const visibility: "private" | "public" = visibilityInput === "public" ? "public" : "private";

    const baseName = sanitizeSegment(file.name.replace(/\.[^.]+$/, ""), "file");
    const filename = `${baseName}-${Date.now()}-${randomSuffix()}.${ext}`;

    const { relativePath, absoluteDir, absoluteFile } = buildPaths(uid, visibility, folder, filename);

    if (!existsSync(absoluteDir)) {
      await mkdir(absoluteDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absoluteFile, buffer);

    return NextResponse.json({
      success: true,
      path: relativePath,
      url: `/api/file/${relativePath}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
