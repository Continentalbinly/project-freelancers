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
        <span className="inline-flex items-center gap-1 text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.confirmed") : "Confirmed"}
        </span>
      );

    /** 🕒 PENDING **/
    case "pending":
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          {t ? t("transactions.status.pending") : "Pending"}
        </span>
      );

    /** 🔒 ESCROW HOLD **/
    case "held":
      return (
        <span className="inline-flex items-center gap-1 text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          {t ? t("transactions.status.held") : "Held"}
        </span>
      );

    /** ⏸️ PAUSED **/
    case "paused":
    case "on_hold":
      return (
        <span className="inline-flex items-center gap-1 text-secondary bg-secondary/10 border border-secondary/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <PauseCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.onHold") : "On Hold"}
        </span>
      );

    /** 🔁 REFUNDED **/
    case "refunded":
    case "escrow_refund":
    case "disputed":
      return (
        <span className="inline-flex items-center gap-1 text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full text-xs font-medium">
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
        <span className="inline-flex items-center gap-1 text-error bg-error/10 border border-error/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <XCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.failed") : "Failed"}
        </span>
      );

    /** ⏳ EXPIRED — FIX ADDED HERE! **/
    case "expired":
      return (
        <span className="inline-flex items-center gap-1 text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <TimerOff className="w-3.5 h-3.5" />
          {t ? t("transactions.status.expired") : "Expired"}
        </span>
      );

    /** 🟣 DISPUTE WARNING **/
    case "dispute_open":
      return (
        <span className="inline-flex items-center gap-1 text-error bg-error/10 border border-error/30 px-2 py-0.5 rounded-full text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          {t ? t("transactions.status.disputed") : "Disputed"}
        </span>
      );

    /** DEFAULT **/
    default:
      return (
        <span className="inline-flex items-center gap-1 text-text-secondary border border-border px-2 py-0.5 rounded-full text-xs font-medium">
          {status || "Unknown"}
        </span>
      );
  }
}
