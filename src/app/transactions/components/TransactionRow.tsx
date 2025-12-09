"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import TransactionAmount from "./TransactionAmount";
import TransactionTypeLabel from "./TransactionTypeLabel";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TransactionRow({ tx, t, isCard = false }: any) {
  const [open, setOpen] = useState(false);
  const lang = t("lang");

  const incomeTypes = [
    "topup",
    "escrow_release",
    "payout_received",
    "posting_fee_refund",
    "proposal_refund",
  ];
  const outcomeTypes = [
    "escrow_payment",
    "posting_fee",
    "proposal_fee",
    "posting_fee_adjust",
    "withdraw_request",
  ];

  const amountColor = incomeTypes.includes(tx.type)
    ? "text-green-600"
    : outcomeTypes.includes(tx.type)
    ? "text-red-600"
    : "text-primary";

  if (!isCard) {
    return (
      <tr className="hover:bg-gray-50 transition">
        <td className="px-5 py-3 flex items-center gap-2">
          <TransactionTypeLabel tx={tx} t={t} />
        </td>

        <td className={`px-5 py-3 font-semibold ${amountColor}`}>
          <TransactionAmount tx={tx} t={t} lang={lang} />
        </td>

        <td className="px-5 py-3 text-gray-500">{tx.paymentMethod || "—"}</td>

        <td className="px-5 py-3">
          <StatusBadge status={tx.status} t={t} />
        </td>

        <td className="px-5 py-3 font-mono text-xs">
          {tx.transactionId || tx.id}
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TransactionTypeLabel tx={tx} t={t} />
        </div>

        <button onClick={() => setOpen(!open)}>
          {open ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className={`mt-2 font-semibold ${amountColor}`}>
        <TransactionAmount tx={tx} t={t} lang={lang} />
      </div>

      <StatusBadge status={tx.status} t={t} />

      {open && (
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <p>
            {t("transactions.columns.method")}: {tx.paymentMethod || "—"}
          </p>
          <p>
            {t("transactions.columns.id")}: {tx.transactionId || tx.id}
          </p>
        </div>
      )}
    </div>
  );
}
