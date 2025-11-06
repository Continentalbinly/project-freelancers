import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");
  if (!filePath) return NextResponse.json({ exists: false }, { status: 400 });

  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    const exists = fs.existsSync(fullPath);
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
