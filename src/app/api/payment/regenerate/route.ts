import { NextResponse } from "next/server";
import { requireDb } from "@/service/firebase";
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

    const db = requireDb();
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
      tag3: oldTx.tag3, // projectId or orderId depending on type
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

    // Update related entity with new transactionId (projects or orders)
    if (oldTx.tag3) {
      const isOrder = oldTx.type === "order_payout" || oldTx.tag2 === "order_payout";
      const targetCollection = isOrder ? "orders" : "projects";
      const targetRef = doc(db, targetCollection, oldTx.tag3);
      const targetSnap = await getDoc(targetRef);

      if (targetSnap.exists()) {
        await updateDoc(targetRef, {
          transactionId: newTxId,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: newTxId,
      qrCode: data.qrCode,
    });
  } catch  {
    // Silent fail
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
