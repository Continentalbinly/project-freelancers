import { NextResponse } from "next/server";
import { db } from "@/service/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const QR_URL =
  "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr";

const PHAYJAY_SECRET_KEY = "$2a$10$" + process.env.PHAYJAY_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const oldTxId = searchParams.get("tx");

    if (!oldTxId) {
      return NextResponse.json({ success: false, error: "Missing txId" });
    }

    const oldRef = doc(db, "transactions", oldTxId);
    const oldSnap = await getDoc(oldRef);

    if (!oldSnap.exists()) {
      return NextResponse.json({ success: false, error: "Old tx not found" });
    }

    const oldTx = oldSnap.data();

    const payload = {
      amount: oldTx.amount,
      description: oldTx.description,
      tag1: oldTx.userId,
      tag2: oldTx.type,
      tag3: oldTx.tag3, // projectId
    };

    const res = await fetch(QR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: PHAYJAY_SECRET_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.transactionId || !data.qrCode) {
      return NextResponse.json({
        success: false,
        error: data.message || "QR generation failed",
      });
    }

    const newTxId = data.transactionId;

    // Create NEW transaction
    await setDoc(doc(db, "transactions", newTxId), {
      id: newTxId,
      transactionId: newTxId,
      amount: oldTx.amount,
      description: oldTx.description,
      paymentMethod: "phajay-qr-sandbox",
      userId: oldTx.userId,
      type: oldTx.type,
      tag1: oldTx.userId,
      tag2: oldTx.type,
      tag3: oldTx.tag3,
      qrCode: data.qrCode,
      qrCreatedAt: serverTimestamp(),
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Expire old transaction
    await updateDoc(oldRef, {
      status: "expired",
      expiredAt: serverTimestamp(),
    });

    // ⭐ CRITICAL: update project with new transactionId
    await updateDoc(doc(db, "projects", oldTx.tag3), {
      transactionId: newTxId,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      transactionId: newTxId,
      qrCode: data.qrCode,
    });
  } catch (err) {
    console.error("Regenerate error:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
