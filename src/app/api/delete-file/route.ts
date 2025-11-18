import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import cloudinary from "cloudinary"; // optional if you use Cloudinary delete

const AUTH_KEY = process.env.NEXT_UPLOAD_KEY || "my_secure_upload_token";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing file URL" },
        { status: 400 }
      );
    }

    // 🔹 Handle local file delete (if in /uploads/)
    if (url.startsWith("/uploads/")) {
      const filePath = join(process.cwd(), "public", url);
      await unlink(filePath);
      console.log(`🗑️ Deleted local file: ${filePath}`);
      return NextResponse.json({ success: true, storage: "local" });
    }

    // 🔹 Handle Cloudinary delete (if stored there)
    if (url.includes("cloudinary.com")) {
      const parts = url.split("/");
      const publicIdWithExt = parts[parts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];

      await cloudinary.v2.uploader.destroy(publicId);
      console.log(`🗑️ Deleted Cloudinary file: ${publicId}`);
      return NextResponse.json({ success: true, storage: "cloudinary" });
    }

    return NextResponse.json(
      { success: false, error: "Unrecognized file path" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("❌ Delete failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
