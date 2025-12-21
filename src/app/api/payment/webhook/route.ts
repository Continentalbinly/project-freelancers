import { NextResponse } from "next/server";
import { requireDb } from "@/service/firebase";
import {
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createTopupNotification } from "@/app/orders/utils/notificationService";

export async function POST(req: Request) {
  try {
    const db = requireDb();
    const raw = await req.text();
    const data = JSON.parse(raw);

    // Log webhook for debugging
    await addDoc(collection(db, "payment_logs"), {
      raw,
      parsed: data,
      receivedAt: serverTimestamp(),
    });

    const { transactionId, txnAmount, status } = data;
    const tag1 = data.tag1 ?? null;
    const tag2 = data.tag2 ?? null;
    const tag3 = data.tag3 ?? null;

    // ❗ PhayJay ALWAYS sends transactionId — this is correct
    if (!transactionId) {
      return NextResponse.json({ error: true });
    }

    // ⭐ Match Firestore transaction by ID (your new regenerate flow)
    const txRef = doc(db, "transactions", transactionId);
    const txSnap = await getDoc(txRef);

    if (!txSnap.exists()) {
      return NextResponse.json({ error: true });
    }

    const savedTx = txSnap.data();

    // Prevent undefined fields
    const safeTag1 = tag1 ?? savedTx.tag1 ?? null;
    const safeTag2 = tag2 ?? savedTx.tag2 ?? null;
    const safeTag3 = tag3 ?? savedTx.tag3 ?? null;

    const userId = safeTag1;
    const credits = Number(safeTag3 ?? savedTx.credits ?? 0);

    // ⭐ Always update transaction (pre-completion)
    await updateDoc(txRef, {
      status: status ?? savedTx.status ?? "unknown",
      amountPaid: txnAmount ?? savedTx.amount,
      userId,
      credits,
      type: safeTag2,
      tag1: safeTag1,
      tag2: safeTag2,
      tag3: safeTag3,
      updatedAt: serverTimestamp(),
    });

    // Stop here if payment is not completed yet
    if (status !== "PAYMENT_COMPLETED") {
      return NextResponse.json({ ok: true });
    }

    // ────────────────────────────────────────────────
    // 1) TOPUP FLOW (KEPT EXACTLY AS YOUR OLD LOGIC)
    // ────────────────────────────────────────────────
    if (safeTag2 === "topup") {
      if (!userId) {
        return NextResponse.json({ error: true });
      }

      const userRef = doc(db, "profiles", userId);

      await updateDoc(userRef, {
        credit: increment(credits),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(txRef, {
        status: "confirmed",
        confirmedAt: serverTimestamp(),
      });

      // Create top-up notification
      try {
        // Parse amount - try txnAmount first, then savedTx.amount
        let amountPaid = 0;
        if (txnAmount !== undefined && txnAmount !== null) {
          amountPaid = Number(txnAmount);
        } else if (savedTx.amount !== undefined && savedTx.amount !== null) {
          amountPaid = Number(savedTx.amount);
        }
        
        const creditsToNotify = Number(credits) || Number(savedTx.credits) || 0;
        
        if (amountPaid > 0 && creditsToNotify > 0 && userId) {
          await createTopupNotification(userId, creditsToNotify, amountPaid);
        }
      } catch (notifError) {
        // Don't fail the webhook if notification creation fails
      }

      return NextResponse.json({ ok: true });
    }

    // ────────────────────────────────────────────────
    // 2) PROJECT PAYOUT FLOW
    // ────────────────────────────────────────────────
    if (safeTag2 === "project_payout") {
      const projectId = safeTag3;

      if (!projectId) {
        await updateDoc(txRef, {
          status: "failed",
          errorReason: "missing_projectId",
          updatedAt: serverTimestamp(),
        });
        return NextResponse.json({ error: true });
      }

      const amountPaid = Number(txnAmount);

      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return NextResponse.json({ error: true });

      const project = projectSnap.data();
      const freelancerId = project.acceptedFreelancerId;
      const clientId = project.clientId;

      // RELEASE ESCROW
      const escrowQuery = query(
        collection(db, "escrows"),
        where("projectId", "==", projectId),
        where("status", "==", "held")
      );
      const escrowSnap = await getDocs(escrowQuery);

      if (!escrowSnap.empty) {
        const escrowDoc = escrowSnap.docs[0];
        await updateDoc(doc(db, "escrows", escrowDoc.id), {
          status: "released",
          freelancerId,
          releasedAt: serverTimestamp(),
        });
      }

      // UPDATE FREELANCER EARNINGS (Safe)
      const freelancerRef = doc(db, "profiles", freelancerId);
      const freelancerSnap = await getDoc(freelancerRef);

      if (freelancerSnap.exists()) {
        const f = freelancerSnap.data() || {};

        const oldTotal = Number(f.totalEarned ?? 0);
        const oldProjects = Number(f.projectsCompleted ?? 0);

        await updateDoc(freelancerRef, {
          totalEarned: oldTotal + amountPaid,
          projectsCompleted: oldProjects + 1,
          updatedAt: serverTimestamp(),
        });
      }

      // ⭐ UPDATE CLIENT STATS (Fully Safe)
      const clientRef = doc(db, "profiles", clientId);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        const clientData = clientSnap.data() || {};

        const clientTotalSpent = Number(clientData.totalSpent ?? 0);
        const clientCompleted = Number(clientData.projectsCompleted ?? 0);

        await updateDoc(clientRef, {
          totalSpent: clientTotalSpent + amountPaid,
          projectsCompleted: clientCompleted + 1,
          updatedAt: serverTimestamp(),
        });
      }

      // INTERNAL TRANSACTION LOGS
      await addDoc(collection(db, "transactions_internal"), {
        userId: freelancerId,
        projectId,
        type: "escrow_release",
        amount: amountPaid,
        direction: "in",
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "transactions_internal"), {
        userId: clientId,
        projectId,
        type: "escrow_payment",
        amount: amountPaid,
        direction: "out",
        createdAt: serverTimestamp(),
      });

      // MARK PROJECT AS COMPLETED
      await updateDoc(projectRef, {
        status: "completed",
        paidAmount: amountPaid,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // ⭐ CREATE FREELANCER TRANSACTION LOG (AUTO ID, SHARES SAME transactionId)
      await addDoc(collection(db, "transactions"), {
        transactionId: transactionId,

        userId: freelancerId,
        projectId,

        type: "payout_received",
        direction: "in",
        paymentMethod: "escrow_release",

        amount: amountPaid,
        amountPaid: amountPaid,

        status: "confirmed",
        description: `Received payout for project ${project.title}`,

        // tags for filtering
        tag1: freelancerId,
        tag2: "payout_received",
        tag3: projectId,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        confirmedAt: serverTimestamp(),
      });

      // CONFIRM THE TRANSACTION
      await updateDoc(txRef, {
        status: "confirmed",
        confirmedAt: serverTimestamp(),
      });

      return NextResponse.json({ ok: true });
    }

    // ────────────────────────────────────────────────
    // 3) ORDER PAYOUT FLOW
    // ────────────────────────────────────────────────
    if (safeTag2 === "order_payout") {
      const orderId = safeTag3;

      if (!orderId) {
        await updateDoc(txRef, {
          status: "failed",
          errorReason: "missing_orderId",
          updatedAt: serverTimestamp(),
        });
        return NextResponse.json({ error: true });
      }

      const amountPaid = Number(txnAmount);

      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return NextResponse.json({ error: true });

      const orderData = orderSnap.data();
      const freelancerId = orderData.sellerId;
      const clientId = orderData.buyerId;

      // RELEASE ESCROW
      const escrowQuery = query(
        collection(db, "escrows"),
        where("orderId", "==", orderId),
        where("status", "==", "held")
      );
      const escrowSnap = await getDocs(escrowQuery);

      if (!escrowSnap.empty) {
        const escrowDoc = escrowSnap.docs[0];
        await updateDoc(doc(db, "escrows", escrowDoc.id), {
          status: "released",
          freelancerId,
          releasedAt: serverTimestamp(),
        });
      }

      // UPDATE FREELANCER EARNINGS
      const freelancerRef = doc(db, "profiles", freelancerId);
      const freelancerSnap = await getDoc(freelancerRef);

      if (freelancerSnap.exists()) {
        const f = freelancerSnap.data() || {};

        const oldTotal = Number(f.totalEarned ?? 0);
        const oldOrders = Number(f.ordersCompleted ?? 0);

        await updateDoc(freelancerRef, {
          totalEarned: oldTotal + amountPaid,
          ordersCompleted: oldOrders + 1,
          updatedAt: serverTimestamp(),
        });
      }

      // UPDATE CLIENT STATS
      const clientRef = doc(db, "profiles", clientId);
      const clientSnap = await getDoc(clientRef);

      if (clientSnap.exists()) {
        const clientData = clientSnap.data() || {};

        const clientTotalSpent = Number(clientData.totalSpent ?? 0);
        const clientOrdersCompleted = Number(clientData.ordersCompleted ?? 0);

        await updateDoc(clientRef, {
          totalSpent: clientTotalSpent + amountPaid,
          ordersCompleted: clientOrdersCompleted + 1,
          updatedAt: serverTimestamp(),
        });
      }

      // INTERNAL TRANSACTION LOGS
      await addDoc(collection(db, "transactions_internal"), {
        userId: freelancerId,
        orderId,
        type: "escrow_release",
        amount: amountPaid,
        direction: "in",
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "transactions_internal"), {
        userId: clientId,
        orderId,
        type: "escrow_payment",
        amount: amountPaid,
        direction: "out",
        createdAt: serverTimestamp(),
      });

      // MARK ORDER AS COMPLETED
      await updateDoc(orderRef, {
        status: "completed",
        paidAmount: amountPaid,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // CREATE NOTIFICATIONS FOR BOTH PARTIES
      try {
        const orderTitle = orderData?.catalogTitle || orderData?.packageName || "Order";
        
        // Notify freelancer about payment received
        await addDoc(collection(db, "notifications"), {
          userId: freelancerId,
          type: "order_payment_received",
          title: "Payment Received",
          message: `You received payment for order "${orderTitle}". Amount: ${amountPaid.toLocaleString()} LAK`,
          orderId,
          orderStatus: "completed",
          read: false,
          createdAt: serverTimestamp(),
        });

        // Notify client about order completion
        await addDoc(collection(db, "notifications"), {
          userId: clientId,
          type: "order_completed",
          title: "Order Completed",
          message: `Your order "${orderTitle}" has been completed and payment has been processed.`,
          orderId,
          orderStatus: "completed",
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifError) {
        // Don't fail the webhook if notification creation fails
      }

      // CREATE FREELANCER TRANSACTION LOG
      await addDoc(collection(db, "transactions"), {
        transactionId: transactionId,

        userId: freelancerId,
        orderId,

        type: "order_payout_received",
        direction: "in",
        paymentMethod: "escrow_release",

        amount: amountPaid,
        amountPaid: amountPaid,

        status: "confirmed",
        description: `Received payout for order ${orderData?.catalogTitle || orderData?.packageName || "Order"}`,

        tag1: freelancerId,
        tag2: "order_payout_received",
        tag3: orderId,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        confirmedAt: serverTimestamp(),
      });

      // CONFIRM THE TRANSACTION
      await updateDoc(txRef, {
        status: "confirmed",
        confirmedAt: serverTimestamp(),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: true });
  }
}
