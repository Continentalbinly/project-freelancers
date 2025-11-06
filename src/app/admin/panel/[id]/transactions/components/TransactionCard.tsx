"use client";

import {
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  Package,
  User,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Money } from "./Money";
import type { Transaction, UserProfile } from "../page";

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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 transition hover:shadow-md">
      {/* Header: user info */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <User className="w-4 h-4 text-primary" />
            {profile?.fullName || "Unknown User"}
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {profile?.email || tx.userId}
          </p>
        </div>

        <div
          className={`text-xs font-semibold px-2 py-1 rounded-md ${
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
      <div className="flex items-center gap-2 text-gray-700">
        <Icon className="w-4 h-4 text-primary" />
        <span className="capitalize">{tx.type.replace("_", " ")}</span>
        <span className="text-gray-400">•</span>
        <Money amount={tx.amount} />
      </div>

      {/* Withdraw Account Info */}
      {isWithdraw && (
        <div className="text-xs text-gray-700 leading-tight bg-gray-50 p-2 rounded-lg border border-gray-100">
          <p className="font-medium">{tx.accountName || "—"}</p>
          {tx.accountNumber && (
            <p className="relative mt-0.5 flex items-center gap-1">
              No:{" "}
              <button
                onClick={handleCopy}
                className="underline cursor-pointer text-primary hover:text-primary-dark transition text-[11px]"
              >
                {tx.accountNumber}
              </button>
              <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
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
      <div className="text-xs text-gray-500 flex flex-wrap justify-between border-t pt-2">
        <p>
          {tx.createdAt
            ? new Date(tx.createdAt.toDate()).toLocaleString()
            : "—"}
        </p>
        <p className="font-mono">{tx.transactionId || tx.id}</p>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex justify-end gap-2 pt-2">
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
