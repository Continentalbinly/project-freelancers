"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Package,
  ArrowLeft,
  Hash,
  Banknote,
} from "lucide-react";

interface Transaction {
  id: string;
  transactionId?: string;
  type: string;
  amount: number;
  status: string;
  plan?: string;
  paymentMethod?: string;
  createdAt?: Timestamp;
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

export default function TransactionsPage() {
  const { t } = useTranslationContext();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user transactions
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setTransactions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (!user?.uid)
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        <p>{t("transactions.signInPrompt")}</p>
      </div>
    );

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary">
            {t("transactions.title")}
          </h1>
          <p className="text-text-secondary mt-1">
            {t("transactions.subtitle")}
          </p>
        </div>
      </section>

      {/* Transaction Table */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-text-secondary animate-pulse">
              {t("transactions.loading")}
            </p>
          ) : transactions.length === 0 ? (
            <div className="text-center text-text-secondary py-10">
              <p className="text-lg font-medium mb-2">
                {t("transactions.empty")}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-primary hover:underline gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> {t("transactions.back")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl shadow-sm bg-white">
              <table className="min-w-full text-sm divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.type")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.plan")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.amount")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.method")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.status")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.date")}
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
                      {t("transactions.columns.id")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 transition-all duration-150"
                    >
                      {/* Type */}
                      <td className="px-5 py-3 flex items-center gap-2 font-medium text-text-primary capitalize">
                        {tx.type === "topup" ? (
                          <CreditCard className="w-4 h-4 text-primary" />
                        ) : (
                          <Package className="w-4 h-4 text-primary" />
                        )}
                        {tx.type === "topup"
                          ? t("transactions.types.topup")
                          : t("transactions.types.subscription")}
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-3 text-text-secondary">
                        {tx.plan || "—"}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3 font-medium text-primary">
                        <Money amount={tx.amount} />
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-3 text-text-secondary flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-primary/80" />
                        {tx.paymentMethod || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        {tx.status === "confirmed" || tx.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />{" "}
                            {t("transactions.status.confirmed")}
                          </span>
                        ) : tx.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" />{" "}
                            {t("transactions.status.pending")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" />{" "}
                            {t("transactions.status.failed")}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3 text-text-secondary text-sm">
                        {tx.createdAt
                          ? new Date(tx.createdAt.toDate()).toLocaleString()
                          : "—"}
                      </td>

                      {/* Transaction ID */}
                      <td className="px-5 py-3 text-xs text-text-secondary font-mono flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-primary/70" />
                        {tx.transactionId || tx.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm underline text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {t("transactions.back")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
