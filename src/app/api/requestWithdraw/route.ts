import { db } from "@/service/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, accountName, accountNumber, amount, source } =
      await req.json();

    if (!userId || !amount || amount <= 0) {
      return Response.json(
        { success: false, error: "Invalid user or amount" },
        { status: 400 }
      );
    }

    // 🔹 Fetch user profile
    const userRef = doc(db, "profiles", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return Response.json({ success: false, error: "User not found" });
    }

    const userData = userSnap.data();

    let previousCredit = userData.credit || 0;
    let previousTotal = userData.totalEarned || 0;
    let newCredit = previousCredit;
    let newTotal = previousTotal;

    // 🔹 Deduct according to selected source
    if (source === "credit") {
      if (previousCredit < amount) {
        return Response.json({ success: false, error: "Insufficient credit" });
      }
      newCredit = previousCredit - amount;
    } else if (source === "totalEarned") {
      if (previousTotal < amount) {
        return Response.json({
          success: false,
          error: "Insufficient total earnings",
        });
      }
      newTotal = previousTotal - amount;
    } else if (source === "all") {
      const totalBalance = previousCredit + previousTotal;
      if (totalBalance < amount) {
        return Response.json({ success: false, error: "Insufficient balance" });
      }

      // Prefer to deduct from credit first, then from totalEarned
      if (previousCredit >= amount) {
        newCredit = previousCredit - amount;
      } else {
        const remainder = amount - previousCredit;
        newCredit = 0;
        newTotal = Math.max(0, previousTotal - remainder);
      }
    }

    // 🔹 Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // 🔹 Create transaction record
    await addDoc(collection(db, "transactions"), {
      userId,
      transactionId,
      type: "withdraw_request",
      status: "pending",
      direction: "out",
      paymentMethod: "manual_bank_transfer",
      currency: "LAK",
      amount,
      accountName,
      accountNumber,
      source,
      description: `Withdraw ${amount} LAK from ${source}`,
      previousCredit,
      previousTotal,
      newCredit,
      newTotal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 🔹 Update user balances
    await updateDoc(userRef, {
      credit: newCredit,
      totalEarned: newTotal,
      updatedAt: serverTimestamp(),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("❌ Withdraw request failed:", err);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
