"use client";

import {
  CheckCircle,
  Clock,
  XCircle,
  PauseCircle,
  AlertCircle,
  Lock,
  RefreshCcw,
  TimerOff,
} from "lucide-react";

interface Props {
  status: string;
  t?: (key: string) => string;
}

export default function StatusBadge({ status, t }: Props) {
  const normalize = status?.toLowerCase?.() || "";

  switch (normalize) {
    /** ✅ SUCCESS / COMPLETED **/
    case "confirmed":
    case "completed":
    case "released":
    case "active":
      return (
        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.confirmed") : "Confirmed"}
        </span>
      );

    /** 🕒 PENDING **/
    case "pending":
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          {t ? t("transactions.status.pending") : "Pending"}
        </span>
      );

    /** 🔒 ESCROW HOLD **/
    case "held":
      return (
        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          {t ? t("transactions.status.held") : "Held"}
        </span>
      );

    /** ⏸️ PAUSED **/
    case "paused":
    case "on_hold":
      return (
        <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <PauseCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.onHold") : "On Hold"}
        </span>
      );

    /** 🔁 REFUNDED **/
    case "refunded":
    case "escrow_refund":
    case "disputed":
      return (
        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <RefreshCcw className="w-3.5 h-3.5" />
          {t ? t("transactions.status.refunded") : "Refunded"}
        </span>
      );

    /** ❌ FAILED **/
    case "failed":
    case "cancelled":
    case "rejected":
    case "error":
      return (
        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <XCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.failed") : "Failed"}
        </span>
      );

    /** ⏳ EXPIRED — FIX ADDED HERE! **/
    case "expired":
      return (
        <span className="inline-flex items-center gap-1 text-gray-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <TimerOff className="w-3.5 h-3.5" />
          {t ? t("transactions.status.expired") : "Expired"}
        </span>
      );

    /** 🟣 DISPUTE WARNING **/
    case "dispute_open":
      return (
        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.disputed") : "Disputed"}
        </span>
      );

    /** DEFAULT **/
    default:
      return (
        <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
          {status || "Unknown"}
        </span>
      );
  }
}
