"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  Wallet,
  RefreshCcw,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import type { Transaction } from "../page";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  t: any;
}

export default function TransactionStats({ transactions, loading, t }: Props) {
  const [activeEscrows, setActiveEscrows] = useState<Transaction[]>([]);

  useEffect(() => {
    const filterActiveEscrows = async () => {
      const escrowTx = transactions.filter(
        (tx) => tx.type === "escrow_hold" && tx.status === "held"
      );

      const validEscrows: Transaction[] = [];

      for (const tx of escrowTx) {
        try {
          if (!tx.projectId) continue;
          const projectRef = doc(db, "projects", tx.projectId);
          const snap = await getDoc(projectRef);
          const data = snap.data();

          if (data && data.status !== "completed" && data.status !== "cancelled") {
            validEscrows.push(tx);
          }
        } catch (err) {
          //console.error("Error checking project status:", err);
        }
      }

      setActiveEscrows(validEscrows);
    };

    if (transactions.length > 0) filterActiveEscrows();
  }, [transactions]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center animate-pulse text-text-secondary">
        {t("transactions.loading")}
      </div>
    );
  }

  const topups = transactions.filter(
    (tx) => tx.type === "topup" && tx.status === "confirmed"
  );
  const refunds = transactions.filter(
    (tx) => tx.type === "escrow_refund" && tx.status === "completed"
  );

  const totalTopup = topups.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalHeld = activeEscrows.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRefunded = refunds.reduce((sum, t) => sum + (t.amount || 0), 0);

  const format = (amt: number) =>
    new Intl.NumberFormat("lo-LA", {
      style: "currency",
      currency: "LAK",
      maximumFractionDigits: 0,
    }).format(amt);

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        {/* Total Top-up */}
        <div className="border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
          <Wallet className="w-8 h-8 text-primary mb-2" />
          <p className="text-sm text-text-secondary">
            {t("transactions.stats.totalTopup")}
          </p>
          <h3 className="text-2xl font-bold  ">
            {format(totalTopup)}
          </h3>
        </div>

        {/* Escrow Held (Active Only) */}
        <div className="border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
          <ArrowDownCircle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-sm text-text-secondary">
              {t("transactions.stats.escrowHeld")}{" "}
              <span className="text-xs text-text-secondary">(Active Only)</span>
            </p>
          <h3 className="text-2xl font-bold  ">
            {format(totalHeld)}
          </h3>
        </div>

        {/* Refunds Completed */}
        <div className="border border-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
          <RefreshCcw className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-text-secondary">
            {t("transactions.stats.refunded")}
          </p>
          <h3 className="text-2xl font-bold  ">
            {format(totalRefunded)}
          </h3>
        </div>
      </div>
    </section>
  );
}
