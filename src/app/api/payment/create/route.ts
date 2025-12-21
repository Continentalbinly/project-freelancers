import { NextResponse } from "next/server";
import { requireDb } from "@/service/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const QR_URL =
  "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr";

const PHAYJAY_PUBLIC_KEY = `${"$2a$10$" + process.env.PHAYJAY_SECRET_KEY!}`;

function generateOrderNo() {
  return `ORDER_${Date.now()}_${Math.floor(Math.random() * 999999)}`;
}

export async function POST(req: Request) {
  try {
    const { amount, description, tag1, tag2, tag3 } = await req.json();

    if (!amount || !description || !tag1 || !tag2) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderNo = generateOrderNo();

    const payload = { amount, description, tag1, tag2, tag3 };

    const res = await fetch(QR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secretKey: PHAYJAY_PUBLIC_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!data.qrCode || !data.transactionId) {
      return NextResponse.json({
        success: false,
        error: data.message || "Failed to generate QR",
      });
    }

    // ⭐ Store transaction metadata
    const db = requireDb();
    await setDoc(doc(db, "transactions", data.transactionId), {
      id: data.transactionId,
      transactionId: data.transactionId,

      userId: tag1,
      type: tag2, // 👈 no longer forced to topup
      amount,
      description,

      tag1,
      tag2,
      tag3,

      credits: tag2 === "topup" ? Number(tag3) : 0, // 👈 only for topup

      status: "pending",
      orderNo,
      qrCode: data.qrCode,
      link: data.link,
      paymentMethod: "phajay-qr-sandbox",
      qrCreatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      qrCode: data.qrCode,
      link: data.link,
      transactionId: data.transactionId,
      orderNo,
    });
  } catch (err) {
    console.error("QR Payment Create Error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
