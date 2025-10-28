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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  Package,
  Hash,
  Calendar,
} from "lucide-react";

interface Transaction {
  id: string;
  transactionId?: string;
  userId: string;
  type: string;
  plan?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: any;
}

interface UserProfile {
  fullName?: string;
  email?: string;
}

function Money({ amount }: { amount: number }) {
  return (
    <span>
      {new Intl.NumberFormat("lo-LA", {
        style: "currency",
        currency: "LAK",
        maximumFractionDigits: 0,
      }).format(amount)}
    </span>
  );
}

export default function AdminTransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {}
  );
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // ✅ Check admin role from Firestore (userType array)
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

  // 🔹 Fetch pending transactions (real-time)
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

      // Fetch associated user profiles for display
      const users: Record<string, UserProfile> = {};
      for (const tx of txs) {
        if (!users[tx.userId]) {
          const ref = doc(db, "profiles", tx.userId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const d = snap.data();
            users[tx.userId] = {
              fullName: d.fullName,
              email: d.email,
            };
          }
        }
      }
      setUserProfiles(users);
    });
    return () => unsub();
  }, [isAdmin]);

  // ✅ Approve payment
  async function handleApprove(tx: Transaction) {
    if (!confirm(`Approve payment of ₭${tx.amount.toLocaleString()}?`)) return;

    const txRef = doc(db, "transactions", tx.id);
    const userRef = doc(db, "profiles", tx.userId);

    await updateDoc(txRef, {
      status: "confirmed",
      updatedAt: serverTimestamp(),
    });

    // update user depending on type
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
    }

    alert("✅ Transaction approved successfully!");
  }

  // ❌ Reject payment
  async function handleReject(tx: Transaction) {
    if (!confirm("Reject this transaction?")) return;
    const txRef = doc(db, "transactions", tx.id);
    await updateDoc(txRef, {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
    alert("🚫 Transaction rejected.");
  }

  if (isAdmin === null)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking admin access...</p>
      </div>
    );

  if (!isAdmin)
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        <p>🚫 You don’t have permission to access this page.</p>
      </div>
    );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            Admin Dashboard — Transactions
          </h1>
          <p className="text-text-secondary mt-1">
            Approve or reject pending user payments.
          </p>
        </div>
      </section>

      {/* Pending Transactions */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {transactions.length === 0 ? (
            <p className="text-center text-text-secondary">
              No pending transactions.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b border-border">
                  <tr className="text-left text-gray-700">
                    <th className="py-3.5 px-4 font-semibold">User</th>
                    <th className="py-3.5 px-4 font-semibold">Type</th>
                    <th className="py-3.5 px-4 font-semibold">Plan</th>
                    <th className="py-3.5 px-4 font-semibold">Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Method</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">
                      Transaction ID
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => {
                    const profile = userProfiles[tx.userId];
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* User info */}
                        <td className="py-3 px-4 align-top">
                          <div>
                            <div className="flex items-center gap-2 font-medium text-text-primary">
                              <User className="w-4 h-4 text-primary" />
                              {profile?.fullName || "Unknown User"}
                            </div>
                            <p className="text-[12px] text-gray-500 mt-0.5">
                              {profile?.email || tx.userId}
                            </p>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 capitalize text-text-secondary">
                          <div className="flex items-center gap-2">
                            {tx.type === "topup" ? (
                              <CreditCard className="w-4 h-4 text-primary" />
                            ) : (
                              <Package className="w-4 h-4 text-primary" />
                            )}
                            {tx.type}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-4 text-gray-600">
                          {tx.plan || "—"}
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 font-medium text-primary whitespace-nowrap">
                          <Money amount={tx.amount} />
                        </td>

                        {/* Method */}
                        <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
                          {tx.paymentMethod || "QR_Manual"}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
                          {tx.createdAt
                            ? new Date(tx.createdAt.toDate()).toLocaleString()
                            : "—"}
                        </td>

                        {/* Transaction ID */}
                        <td className="py-3 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                          {tx.transactionId || tx.id}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button suppressHydrationWarning
                              onClick={() => handleApprove(tx)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button suppressHydrationWarning
                              onClick={() => handleReject(tx)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
