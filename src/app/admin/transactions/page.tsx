"use client";

import { useEffect, useState } from "react";
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
import { db } from "@/service/firebase";
import TransactionHeader from "./components/TransactionHeader";
import TransactionTable from "./components/TransactionTable";
import GlobalStatus from "../../components/GlobalStatus";

export interface Transaction {
  id: string;
  transactionId?: string;
  userId: string;
  type: string;
  plan?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: any;
  accountName?: string;
  accountNumber?: string;
  source?: "credit" | "totalEarned" | "all";
  description?: string;
  currency?: string;
  previousCredit?: number;
  previousTotal?: number;
  newCredit?: number;
  newTotal?: number;
}

export interface UserProfile {
  fullName?: string;
  email?: string;
}

export default function AdminTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // ✅ Check admin role
  useEffect(() => {
    async function checkRole() {
      if (!user?.uid) return setIsAdmin(false);
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      const data = snap.data();
      const type = data?.userType;
      if (Array.isArray(type)) setIsAdmin(type.includes("admin"));
      else setIsAdmin(type === "admin");
    }
    checkRole();
  }, [user]);

  // 🔹 Fetch transactions (real-time)
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(
      collection(db, "transactions"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const txs = snap.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setTransactions(txs);

      // Fetch related profiles
      const users: Record<string, UserProfile> = {};
      for (const tx of txs) {
        if (!users[tx.userId]) {
          const ref = doc(db, "profiles", tx.userId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            users[tx.userId] = { fullName: d.fullName, email: d.email };
          }
        }
      }
      setUserProfiles(users);
    });

    return () => unsub();
  }, [isAdmin]);

  // ✅ Approve Transaction
  async function handleApprove(tx: Transaction) {
    if (!confirm(`Approve ${tx.type} of ₭${tx.amount.toLocaleString()}?`))
      return;

    const txRef = doc(db, "transactions", tx.id);
    const userRef = doc(db, "profiles", tx.userId);

    await updateDoc(txRef, {
      status: "confirmed",
      approvedBy: user?.uid || "admin",
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (tx.type === "subscription") {
      await updateDoc(userRef, {
        plan: tx.plan || "basic",
        planStatus: "active",
        planStartDate: serverTimestamp(),
        planEndDate: null,
        updatedAt: serverTimestamp(),
      });
    } else if (tx.type === "topup") {
      await updateDoc(userRef, {
        credit: increment(tx.amount),
        updatedAt: serverTimestamp(),
      });
    } else if (tx.type === "withdraw_request") {
      // Withdraw is already deducted on request — just mark as confirmed
      console.log("✅ Withdraw confirmed, no credit change required.");
    }

    alert("✅ Transaction approved successfully!");
  }

  // ❌ Reject Transaction (with precise rollback)
  async function handleReject(tx: Transaction) {
    if (!confirm("Reject this transaction?")) return;

    const txRef = doc(db, "transactions", tx.id);
    const userRef = doc(db, "profiles", tx.userId);

    // Mark transaction rejected
    await updateDoc(txRef, {
      status: "rejected",
      rejectedBy: user?.uid || "admin",
      updatedAt: serverTimestamp(),
    });

    // 🪙 Refund logic only for withdraws
    if (tx.type === "withdraw_request") {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const updateData: any = { updatedAt: serverTimestamp() };

        // ✅ Use accurate rollback if available
        if (
          typeof tx.previousCredit === "number" &&
          typeof tx.previousTotal === "number"
        ) {
          updateData.credit = tx.previousCredit;
          updateData.totalEarned = tx.previousTotal;
        } else {
          // 🧭 Backward compatibility fallback
          const source = tx.source || "credit";
          if (source === "credit") {
            updateData.credit = increment(tx.amount);
          } else if (source === "totalEarned") {
            updateData.totalEarned = increment(tx.amount);
          } else if (source === "all") {
            // Refund proportionally or to credit if no split data
            updateData.credit = increment(tx.amount);
          }
        }

        await updateDoc(userRef, updateData);

        // ✅ Log refund transaction for audit trail
        await addDoc(collection(db, "transactions"), {
          userId: tx.userId,
          type: "refund",
          status: "confirmed",
          direction: "in",
          currency: tx.currency || "LAK",
          amount: tx.amount,
          description: `Refund for rejected withdrawal ${tx.transactionId}`,
          restoredCredit:
            typeof tx.previousCredit === "number"
              ? tx.previousCredit
              : data.credit || 0,
          restoredTotalEarned:
            typeof tx.previousTotal === "number"
              ? tx.previousTotal
              : data.totalEarned || 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    alert("🚫 Transaction rejected and user balance restored.");
  }

  // 🔒 Guard states
  if (isAdmin === null)
    return <GlobalStatus type="loading" message="Checking admin access..." />;

  if (!isAdmin)
    return (
      <GlobalStatus
        type="denied"
        message="🚫 You don’t have permission to access this page."
      />
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <TransactionHeader />
      <TransactionTable
        transactions={transactions}
        userProfiles={userProfiles}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
