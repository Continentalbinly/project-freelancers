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

export interface Transaction {
  id: string;
  transactionId?: string;
  type: string;
  amount: number;
  status: string;
  plan?: string;
  paymentMethod?: string;
  projectId?: string;
  userId?: string;
  currency?: string;
  description?: string;
  createdAt?: Timestamp;
}

export default function TransactionsPage() {
  const { t } = useTranslationContext();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Filter state
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // ⭐ Filtering logic
  const filtered = transactions.filter((tx) => {
    const typeOK = typeFilter === "all" || tx.type === typeFilter;
    const statusOK = statusFilter === "all" || tx.status === statusFilter;
    return typeOK && statusOK;
  });

  if (!user?.uid)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );

  return (
    <div className="bg-background pt-4">
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ⭐ Table */}
          <TransactionTable transactions={filtered} loading={loading} t={t} />

          {/* Back */}
          <div className="text-center mt-6">
            <Link
              href="/"
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
