"use client";

import { useEffect, useState } from "react";
import { db } from "@/service/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useTranslationContext } from "@/app/components/LanguageProvider";

// ✅ Type Definition
interface WithdrawTx {
  id: string;
  amount: number;
  status: string;
  accountName?: string;
  paymentMethod?: string;
  createdAt?: any;
}

export default function WithdrawHistory({ userId }: { userId: string }) {
  const { t } = useTranslationContext();

  // ✅ FIXED STATE TYPE
  const [transactions, setTransactions] = useState<WithdrawTx[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("type", "==", "withdraw_request"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const formatted = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as WithdrawTx[];

      setTransactions(formatted);
    });

    return () => unsub();
  }, [userId]);

  return (
    <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <h2 className="text-xl font-bold mb-4 text-text-primary">{t("withdraw.history.title")}</h2>

      {transactions.length === 0 ? (
        <p className="text-text-secondary">{t("withdraw.history.empty")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="py-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-text-primary">
                  {tx.amount?.toLocaleString()} LAK
                </span>

                <span
                  className={`px-2 py-1 rounded-xl text-xs ${
                    tx.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : tx.status === "approved"
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {t(`withdraw.status.${tx.status}`)}
                </span>
              </div>

              <p className="text-xs text-text-secondary mt-1">
                {tx.accountName} •{" "}
                {t(`withdraw.method.${tx.paymentMethod || "manual"}`)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
