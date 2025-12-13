"use client";

import {
  CreditCard,
  Package,
  RefreshCcw,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Receipt,
  ArrowRightLeft,
  Wallet,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

export default function TransactionTypeLabel({ tx, t }: any) {
  const map: any = {
    topup: (
      <>
        <CreditCard className="w-4 h-4 text-primary" />{" "}
        {t("transactions.types.topup")}
      </>
    ),
    project_payout: (
      <>
        <Receipt className="w-4 h-4 text-blue-600" />{" "}
        {t("transactions.types.project_payout")}
      </>
    ),
    payout_received: (
      <>
        <BanknoteArrowDown className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.payout_received")}
      </>
    ),
    order_payout: (
      <>
        <Receipt className="w-4 h-4 text-blue-600" />{" "}
        {t("transactions.types.order_payout")}
      </>
    ),
    order_payout_received: (
      <>
        <BanknoteArrowDown className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.order_payout_received")}
      </>
    ),
    order_placement_fee: (
      <>
        <Receipt className="w-4 h-4 text-orange-600" />{" "}
        {t("transactions.types.order_placement_fee")}
      </>
    ),
    escrow_payment: (
      <>
        <BanknoteArrowUp className="w-4 h-4 text-red-600" />{" "}
        {t("transactions.types.escrowPayment")}
      </>
    ),
    escrow_release: (
      <>
        <BanknoteArrowDown className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.escrow_release")}
      </>
    ),
    escrow_hold: (
      <>
        <Wallet className="w-4 h-4 text-amber-500" />{" "}
        {t("transactions.types.escrowHold")}
      </>
    ),
    escrow_refund: (
      <>
        <RefreshCcw className="w-4 h-4 text-purple-600" />{" "}
        {t("transactions.types.escrowRefund")}
      </>
    ),
    withdraw_request: (
      <>
        <ArrowDown className="w-4 h-4 text-red-600" />{" "}
        {t("transactions.types.withdrawRequest")}
      </>
    ),
    withdraw_request_success: (
      <>
        <ArrowRightLeft className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.withdrawSuccess")}
      </>
    ),

    // NEW TYPES
    proposal_fee: (
      <>
        <Receipt className="w-4 h-4 text-orange-600" />{" "}
        {t("transactions.types.proposal_fee")}
      </>
    ),
    proposal_refund: (
      <>
        <ArrowDown className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.proposal_refund")}
      </>
    ),

    posting_fee: (
      <>
        <Receipt className="w-4 h-4 text-text-secondary" />{" "}
        {t("transactions.types.posting_fee")}
      </>
    ),
    posting_fee_adjust: (
      <>
        <ArrowUp className="w-4 h-4 text-orange-500" />{" "}
        {t("transactions.types.posting_fee_adjust")}
      </>
    ),
    posting_fee_refund: (
      <>
        <ArrowDown className="w-4 h-4 text-green-600" />{" "}
        {t("transactions.types.posting_fee_refund")}
      </>
    ),

    subscription: (
      <>
        <CreditCard className="w-4 h-4 text-primary" />{" "}
        {t("transactions.types.subscription")}
      </>
    ),
    refund: (
      <>
        <RefreshCcw className="w-4 h-4 text-purple-700" />{" "}
        {t("transactions.types.refund")}
      </>
    ),
  };

  return (
    <>
      {map[tx.type] ?? (
        <>
          <Package className="w-4 h-4 text-text-secondary" /> {tx.type}
        </>
      )}
    </>
  );
}
