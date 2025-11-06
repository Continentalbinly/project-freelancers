"use client";

import {
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Package,
  Wallet,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Money } from "./Money";
import type { Transaction, UserProfile } from "../page";

export default function TransactionRow({
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

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {/* 👤 User Info */}
      <td className="py-3 px-4 align-top">
        <div>
          <div className="flex items-center gap-2 font-medium text-gray-800">
            <User className="w-4 h-4 text-primary" />
            {profile?.fullName || "Unknown User"}
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {profile?.email || tx.userId}
          </p>
        </div>
      </td>

      {/* 💼 Type */}
      <td className="py-3 px-4 capitalize text-gray-600">
        <div className="flex items-center gap-2">
          {isWithdraw ? (
            <Wallet className="w-4 h-4 text-purple-600" />
          ) : tx.type === "topup" ? (
            <CreditCard className="w-4 h-4 text-primary" />
          ) : (
            <Package className="w-4 h-4 text-primary" />
          )}
          {tx.type.replace("_", " ")}
        </div>
      </td>

      {/* 📋 Plan / Source */}
      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
        {isWithdraw ? tx.source || "—" : tx.plan || "—"}
      </td>

      {/* 💰 Amount */}
      <td className="py-3 px-4 font-medium text-primary whitespace-nowrap">
        <Money amount={tx.amount} />
      </td>

      {/* 🏦 Payment / Account Info */}
      <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
        {isWithdraw ? (
          <div className="text-xs text-gray-700 leading-tight">
            <p className="font-medium">{tx.accountName || "—"}</p>
            <p className="relative flex items-center gap-1">
              <span className="text-gray-500">No:</span>
              {tx.accountNumber ? (
                <>
                  <button
                    onClick={() => handleCopy(String(tx.accountNumber))}
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
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        ) : (
          tx.paymentMethod || "QR_Manual"
        )}
      </td>

      {/* 🕒 Date */}
      <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
        {tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleString() : "—"}
      </td>

      {/* 🧾 Transaction ID */}
      <td className="py-3 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">
        {tx.transactionId || tx.id}
      </td>

      {/* ✅ / ❌ Actions or Status */}
      <td className="py-3 px-4 text-center">
        {isPending ? (
          <div className="flex justify-center gap-2">
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${
              tx.status === "confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {tx.status === "confirmed" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {tx.status}
          </span>
        )}
      </td>
    </tr>
  );
}
