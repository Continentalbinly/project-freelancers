"use client";

import {
  CheckCircle,
  XCircle,
  User,
  CreditCard,
  Package,
  Wallet,
  Banknote,
} from "lucide-react";
import { Money } from "./Money";
import type { Transaction, UserProfile } from "../page";
import { useState } from "react";

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
  const isWithdraw = tx.type === "withdraw_request";
  const [copied, setCopied] = useState(false);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
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

      {/* 🪙 Extra withdraw details */}
      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
        {isWithdraw ? tx.source || "—" : tx.plan || "—"}
      </td>

      <td className="py-3 px-4 font-medium text-primary whitespace-nowrap">
        <Money amount={tx.amount} />
      </td>

      <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
        {isWithdraw ? (
          <div className="text-xs text-gray-700 leading-tight">
            <p>Acct: {tx.accountName || "—"}</p>
            <p className="relative">
              No:{" "}
              {tx.accountNumber ? (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(String(tx.accountNumber));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="underline cursor-pointer text-primary hover:text-primary-dark transition text-[11px]"
                >
                  {tx.accountNumber}
                  {copied && (
                    <span className="absolute bg-black text-white text-[10px] px-2 py-1 rounded-md left-1/2 -translate-x-1/2 -top-5">
                      Copied!
                    </span>
                  )}
                </button>
              ) : (
                "—"
              )}
            </p>
          </div>
        ) : (
          tx.paymentMethod || "QR_Manual"
        )}
      </td>

      <td className="py-3 px-4 text-gray-600 text-sm whitespace-nowrap">
        {tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleString() : "—"}
      </td>

      <td className="py-3 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">
        {tx.transactionId || tx.id}
      </td>

      <td className="py-3 px-4 text-center">
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
      </td>
    </tr>
  );
}
