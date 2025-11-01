"use client";

import {
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Package,
  Hash,
  Banknote,
  RefreshCcw,
} from "lucide-react";
import type { Transaction } from "../page";
import Money from "./Money";
import StatusBadge from "./StatusBadge";

export default function TransactionRow({ tx, t }: { tx: Transaction; t: any }) {
  const renderType = () => {
    switch (tx.type) {
      case "topup":
        return (
          <>
            <CreditCard className="w-4 h-4 text-primary" />
            {t("transactions.types.topup")}
          </>
        );
      case "escrow_hold":
        return (
          <>
            <Package className="w-4 h-4 text-amber-500" />
            {t("transactions.types.escrowHold")}
          </>
        );
      case "escrow_refund":
        return (
          <>
            <RefreshCcw className="w-4 h-4 text-green-600" />
            {t("transactions.types.escrowRefund")}
          </>
        );
      default:
        return (
          <>
            <Package className="w-4 h-4 text-primary" />
            {tx.type}
          </>
        );
    }
  };

  const renderStatus = () => {
    switch (tx.status) {
      case "confirmed":
      case "completed":
      case "active":
      case "released":
        return (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />{" "}
            {t("transactions.status.confirmed")}
          </span>
        );
      case "pending":
      case "held":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> {t("transactions.status.pending")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" />{" "}
            {t("transactions.status.failed")}
          </span>
        );
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-all duration-150">
      {/* Type */}
      <td className="px-5 py-3 flex items-center gap-2 font-medium text-text-primary capitalize">
        {renderType()}
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
        <StatusBadge status={tx.status} t={t} />
      </td>

      {/* Date */}
      <td className="px-5 py-3 text-text-secondary text-sm">
        {tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleString() : "—"}
      </td>

      {/* Transaction ID */}
      <td className="px-5 py-3 text-xs text-text-secondary font-mono flex items-center gap-1">
        <Hash className="w-3.5 h-3.5 text-primary/70" />
        {tx.transactionId || tx.id}
      </td>
    </tr>
  );
}
