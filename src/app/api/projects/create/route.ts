import { NextResponse } from "next/server";

/**
 * POST /api/projects/create
 * Creates a new project
 */
export async function POST() {
  try {
    // Implementation pending
    return NextResponse.json(
      { success: false, error: "Not implemented" },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
