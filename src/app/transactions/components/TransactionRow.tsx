"use client";

import {
  CreditCard,
  Package,
  Hash,
  Banknote,
  RefreshCcw,
  BanknoteArrowDown,
  BanknoteArrowUp,
} from "lucide-react";
import type { Transaction } from "../page";
import Money from "./Money";
import StatusBadge from "./StatusBadge";

export default function TransactionRow({
  tx,
  t,
  isCard = false,
}: {
  tx: Transaction;
  t: any;
  isCard?: boolean;
}) {
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
      case "withdraw_request":
        return (
          <>
            <BanknoteArrowDown className="w-4 h-4 text-red-600" />
            {t("transactions.types.withdrawRequest")}
          </>
        );
      case "subscription":
        return (
          <>
            <CreditCard className="w-4 h-4 text-primary" />
            {t("transactions.types.subscription")}
          </>
        );
      case "refund":
        return (
          <>
            <RefreshCcw className="w-4 h-4 text-red-600" />
            {t("transactions.types.refund")}
          </>
        );
      case "escrow_add":
        return (
          <>
            <BanknoteArrowUp className="w-4 h-4 text-green-600" />
            {t("transactions.types.escrowAdd")}
          </>
        );
      case "escrow_payment":
        return (
          <>
            <BanknoteArrowUp className="w-4 h-4 text-red-600" />
            {t("transactions.types.escrowPayment")}
          </>
        );
      case "escrow_release":
        return (
          <>
            <BanknoteArrowDown className="w-4 h-4 text-green-600" />
            {t("transactions.types.escrow_release")}
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

  if (!isCard) {
    // === Desktop Row ===
    return (
      <tr className="hover:bg-gray-50 transition-all duration-150">
        <td className="px-5 py-3 flex items-center gap-2 font-medium text-text-primary capitalize">
          {renderType()}
        </td>
        <td className="px-5 py-3 font-medium text-primary">
          <Money amount={tx.amount} />
        </td>
        <td className="px-5 py-3 text-text-secondary flex items-center gap-1">
          <Banknote className="w-3.5 h-3.5 text-primary/80" />
          {tx.paymentMethod || "—"}
        </td>
        <td className="px-5 py-3">
          <StatusBadge status={tx.status} t={t} />
        </td>
        <td className="px-5 py-3 text-text-secondary text-sm">
          {tx.createdAt
            ? new Date(tx.createdAt.toDate()).toLocaleString()
            : "—"}
        </td>
        <td className="px-5 py-3 text-xs text-text-secondary font-mono flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-primary/70" />
          {tx.transactionId || tx.id}
        </td>
      </tr>
    );
  }

  // === Mobile Card ===
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-text-primary capitalize">
          {renderType()}
        </div>
        <div className="font-semibold text-primary">
          <Money amount={tx.amount} />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span className="flex items-center gap-1">
          <Banknote className="w-3.5 h-3.5 text-primary/80" />
          {tx.paymentMethod || "—"}
        </span>
        <StatusBadge status={tx.status} t={t} />
      </div>

      <div className="flex flex-col text-xs text-text-secondary mt-2">
        <span>
          {tx.createdAt
            ? new Date(tx.createdAt.toDate()).toLocaleString()
            : "—"}
        </span>
        <div className="flex items-center gap-1 font-mono mt-1 text-[11px] text-primary/70 break-all">
          <Hash className="w-3 h-3" />
          {tx.transactionId || tx.id}
        </div>
      </div>
    </div>
  );
}
