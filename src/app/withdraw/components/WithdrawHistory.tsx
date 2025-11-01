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

export default function WithdrawHistory({ userId }: { userId: string }) {
  const { t } = useTranslationContext();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("type", "==", "withdraw_request"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(data);
    });
    return () => unsub();
  }, [userId]);

  return (
    <div className="bg-gray-50 border border-border rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="font-semibold text-lg text-text-primary mb-3">
        {t("withdraw.history.title")}
      </h2>

      {transactions.length === 0 ? (
        <p className="text-text-secondary text-sm">
          {t("withdraw.history.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="py-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="font-medium">
                  {tx.amount?.toLocaleString()} LAK
                </span>
                <span
                  className={`${
                    tx.status === "pending"
                      ? "text-warning"
                      : tx.status === "approved"
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  {t(`withdraw.status.${tx.status}`)}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
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
