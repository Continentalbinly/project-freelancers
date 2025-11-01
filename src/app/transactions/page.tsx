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
import { ArrowLeft } from "lucide-react";
import TransactionTable from "./components/TransactionTable";
import TransactionStats from "./components/TransactionStats";

export interface Transaction {
  id: string;
  transactionId?: string;
  type: string;
  amount: number;
  status: string;
  plan?: string;
  paymentMethod?: string;
  createdAt?: Timestamp;
}

export default function TransactionsPage() {
  const { t } = useTranslationContext();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all transactions for this user
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

      {/* Stats Summary */}
      <TransactionStats transactions={transactions} loading={loading} t={t} />

      {/* Table */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <TransactionTable
            transactions={transactions}
            loading={loading}
            t={t}
          />
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
