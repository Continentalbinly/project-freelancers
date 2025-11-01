"use client";

import TransactionRow from "./TransactionRow";
import type { Transaction } from "../page";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  t: any;
}

export default function TransactionTable({ transactions, loading, t }: Props) {
  if (loading)
    return (
      <p className="text-center text-text-secondary animate-pulse">
        {t("transactions.loading")}
      </p>
    );

  if (transactions.length === 0)
    return (
      <div className="text-center text-text-secondary py-10">
        <p className="text-lg font-medium mb-2">{t("transactions.empty")}</p>
      </div>
    );

  return (
    <div className="overflow-x-auto border border-border rounded-xl shadow-sm bg-white">
      <table className="min-w-full text-sm divide-y divide-border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider">
              {t("transactions.columns.type")}
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
            <TransactionRow key={tx.id} tx={tx} t={t} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
