"use client";

import {
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  Package,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Money } from "./Money";
import type { Transaction, UserProfile } from "../page";
import Avatar from "@/app/utils/avatarHandler";

export default function TransactionCard({
  tx,
  profile,
  onApprove,
  onReject,
}: {
  tx: Transaction;
  profile?: UserProfile;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isWithdraw = tx.type === "withdraw_request";
  const isPending = tx.status === "pending";

  const icon =
    tx.type === "withdraw_request"
      ? Wallet
      : tx.type === "topup"
      ? CreditCard
      : Package;

  const Icon = icon;

  function handleCopy() {
    if (!tx.accountNumber) return;
    navigator.clipboard.writeText(tx.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4 transition hover:shadow-md bg-background">
      {/* Header: Avatar + user info + status */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar
            src={profile?.avatarUrl}
            alt={profile?.fullName}
            name={profile?.fullName || "Unknown"}
            size="md"
            className="border border-border shadow-sm"
          />

          {/* User details */}
          <div className="leading-tight max-w-[120px] truncate">
            <div
              className="font-semibold text-text-primary text-sm truncate"
              title={profile?.fullName || "Unknown User"}
            >
              {profile?.fullName || "Unknown User"}
            </div>

            <div
              className="text-[11px] text-text-secondary font-mono truncate"
              title={profile?.email || tx.userId}
            >
              {profile?.email || tx.userId}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`text-xs font-semibold px-2 py-1 rounded-md shrink-0 ${
            tx.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : tx.status === "confirmed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {tx.status}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="flex flex-col gap-1 text-text-secondary text-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="capitalize truncate">
            {tx.type.replace("_", " ")}
          </span>
          <span className="text-text-muted">•</span>
          <Money amount={tx.amount} />
        </div>

        {/* Credits (only for topup) */}
        {tx.type === "topup" && tx.credits !== undefined && (
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Package className="w-4 h-4" />+ {tx.credits} credits
          </div>
        )}
      </div>

      {/* Withdraw Account Info */}
      {isWithdraw && (
        <div className="text-xs text-text-secondary leading-tight p-2 rounded-lg border border-border">
          <p className="font-medium">{tx.accountName || "—"}</p>
          {tx.accountNumber && (
            <p className="relative mt-0.5 flex items-center gap-1 truncate">
              No:{" "}
              <button
                onClick={handleCopy}
                className="underline cursor-pointer text-primary hover:text-primary-dark transition text-[11px] truncate"
              >
                {tx.accountNumber}
              </button>
              <Copy className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary" />
              {copied && (
                <span className="absolute bg-black text-white text-[10px] px-2 py-1 rounded-md left-1/2 -translate-x-1/2 -top-5">
                  Copied!
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="text-[11px] text-text-secondary flex flex-wrap justify-between border-t border-border pt-2">
        <p className="truncate">
          {tx.createdAt
            ? new Date(
                typeof tx.createdAt === 'object' && 'toDate' in tx.createdAt
                  ? (tx.createdAt as Record<string, unknown> & { toDate: () => Date }).toDate()
                  : tx.createdAt instanceof Date
                  ? tx.createdAt
                  : new Date()
              ).toLocaleString()
            : "—"}
        </p>
        <p className="font-mono truncate">{tx.transactionId || tx.id}</p>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onReject}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            <XCircle className="w-4 h-4" /> Reject
          </button>
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
        </div>
      )}
    </div>
  );
}
