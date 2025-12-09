import { NextResponse } from "next/server";
import { db } from "@/service/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId" },
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
  } catch (err) {
    console.error("Expire transaction error:", err);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
