import { NextResponse } from "next/server";
import { requireDb } from "@/service/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const db = requireDb();
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing transactionId" },
        { status: 400 }
      );
    }

    const txRef = doc(db, "transactions", transactionId);

    await updateDoc(txRef, {
      status: "expired",
      expiredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
