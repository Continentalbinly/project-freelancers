"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { requireDb } from "@/service/firebase";

import TransactionTabs from "./components/TransactionTabs";
import TransactionTable from "./components/TransactionTable";
import GlobalStatus from "../../../../components/GlobalStatus";
import TransactionHeader from "./components/TransactionHeader";

import { toast } from "react-toastify";
import type { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  transactionId?: string;
  userId: string;
  type: string;
  plan?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: Timestamp | Date | Record<string, unknown>;
  accountName?: string;
  accountNumber?: string;
  source?: "credit" | "totalEarned" | "all";
  description?: string;
  currency?: string;
  previousCredit?: number;
  previousTotal?: number;
  newCredit?: number;
  newTotal?: number;
  approvedBy?: string;
  rejectedBy?: string;
  credits?: number; // Credits a user gets (🔥 important)
}

export interface UserProfile {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

function AdminTransactionsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status") || "pending";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // -------------------------------------------------------
  // 🔐 CHECK ADMIN ROLE
  // -------------------------------------------------------
  useEffect(() => {
    async function checkRole() {
      if (!user?.uid) return setIsAdmin(false);

      const ref = doc(requireDb(), "profiles", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();

      const type = data?.userType;
      if (Array.isArray(type)) setIsAdmin(type.includes("admin"));
      else setIsAdmin(type === "admin");
    }
    checkRole();
  }, [user]);

  // -------------------------------------------------------
  // 🔥 UPDATE TOPUP SESSION STATUS
  // -------------------------------------------------------
  async function updateTopupSession(
    tx: Transaction,
    status: "approved" | "rejected"
  ) {
    if (!tx.transactionId) return; // Only for QR top-ups

    const ref = doc(requireDb(), "topupSessions", tx.transactionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  // -------------------------------------------------------
  // 🔄 FETCH TRANSACTIONS REAL-TIME
  // -------------------------------------------------------
  useEffect(() => {
    if (!isAdmin) return;

    if (!["pending", "confirmed", "rejected", "all"].includes(statusParam)) {
      router.replace(`/admin/panel/${params.id}/transactions?status=pending`);
      return;
    }

    const baseQuery = collection(requireDb(), "transactions");

    const q =
      statusParam === "all"
        ? query(baseQuery, orderBy("createdAt", "desc"))
        : query(
            baseQuery,
            where("status", "==", statusParam),
            orderBy("createdAt", "desc")
          );

    const unsub = onSnapshot(q, async (snap) => {
      const txs = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setTransactions(txs);

      // Fetch unique profiles
      const users: Record<string, UserProfile> = {};
      for (const tx of txs) {
        if (!users[tx.userId]) {
          const ref = doc(requireDb(), "profiles", tx.userId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            users[tx.userId] = {
              fullName: d.fullName,
              email: d.email,
              avatarUrl: d.avatarUrl,
            };
          }
        }
      }

      setUserProfiles(users);
    });

    return () => unsub();
  }, [isAdmin, statusParam, params.id, router]);

  // -------------------------------------------------------
  // ✅ APPROVE TRANSACTION (FIXED LOGIC)
  // -------------------------------------------------------
  async function handleApprove(tx: Transaction) {
    const confirmText =
      tx.type === "topup" && typeof tx.credits === "number"
        ? `Approve TOP-UP: +${tx.credits} credits?`
        : `Approve ${tx.type} of ₭${tx.amount.toLocaleString()}?`;

    if (!confirm(confirmText)) return;

    const txRef = doc(requireDb(), "transactions", tx.id);
    const userRef = doc(requireDb(), "profiles", tx.userId);

    // 🔵 Update transaction
    await updateDoc(txRef, {
      status: "confirmed",
      approvedBy: user?.uid || "admin",
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // -------------------------------------------------------
    // 🔵 Subscription Approval
    // -------------------------------------------------------
    if (tx.type === "subscription") {
      await updateDoc(userRef, {
        plan: tx.plan || "basic",
        planStatus: "active",
        planStartDate: serverTimestamp(),
        planEndDate: null,
        updatedAt: serverTimestamp(),
      });
    }

    // -------------------------------------------------------
    // 🔵 FIXED: Top-Up Approval → Add CREDITS, NOT LAK
    // -------------------------------------------------------
    else if (tx.type === "topup") {
      if (typeof tx.credits !== "number") {
        toast.error(
          "❌ This top-up has no credit value. Cannot approve automatically.",
          { theme: "colored" }
        );
        return;
      }

      await updateDoc(userRef, {
        credit: increment(tx.credits), // 🔥 Correct value
        updatedAt: serverTimestamp(),
      });

      // Update topup session
      await updateTopupSession(tx, "approved");
    }

    toast.success("Transaction approved successfully!", {
      theme: "colored",
    });
  }

  // -------------------------------------------------------
  // ❌ REJECT TRANSACTION
  // -------------------------------------------------------
  async function handleReject(tx: Transaction) {
    if (!confirm("Reject this transaction?")) return;

    const txRef = doc(requireDb(), "transactions", tx.id);
    const userRef = doc(requireDb(), "profiles", tx.userId);

    await updateDoc(txRef, {
      status: "rejected",
      rejectedBy: user?.uid || "admin",
      updatedAt: serverTimestamp(),
    });

    // Withdrawal rollback
    if (tx.type === "withdraw_request") {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };

        if (
          typeof tx.previousCredit === "number" &&
          typeof tx.previousTotal === "number"
        ) {
          updateData.credit = tx.previousCredit;
          updateData.totalEarned = tx.previousTotal;
        } else {
          updateData.credit = increment(tx.amount);
        }

        await updateDoc(userRef, updateData);

        await addDoc(collection(requireDb(), "transactions"), {
          userId: tx.userId,
          type: "refund",
          status: "confirmed",
          direction: "in",
          currency: tx.currency || "LAK",
          amount: tx.amount,
          description: `Refund for rejected withdrawal ${tx.transactionId}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Reject topup session
    if (tx.type === "topup") {
      await updateTopupSession(tx, "rejected");
    }

    toast.error("Transaction rejected.", {
      theme: "colored",
    });
  }

  // -------------------------------------------------------
  // 🔒 GUARD STATES
  // -------------------------------------------------------
  if (isAdmin === null)
    return <GlobalStatus type="loading" message="Checking admin access..." />;

  if (!isAdmin)
    return (
      <GlobalStatus
        type="denied"
        message="🚫 You don’t have permission to access this page."
      />
    );

  // -------------------------------------------------------
  // 🎨 RENDER
  // -------------------------------------------------------
  return (
    <div className="min-h-screen">
      <TransactionHeader />
      <TransactionTabs currentStatus={statusParam} />
      <TransactionTable
        transactions={transactions}
        userProfiles={userProfiles}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <Suspense
      fallback={
        <GlobalStatus type="loading" message="Loading transactions..." />
      }
    >
      <AdminTransactionsPageContent />
    </Suspense>
  );
}
