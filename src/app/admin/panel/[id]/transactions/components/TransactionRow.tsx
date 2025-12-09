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
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";

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
      {/* USER INFO */}
      <td className="py-3 px-4 align-top">
        <div className="flex items-center gap-3">
          {/* USER AVATAR */}
          <Avatar
            src={profile?.avatarUrl}
            alt={profile?.fullName}
            name={profile?.fullName || "Unknown"}
            size="lg"
            className="shadow-sm border border-gray-200"
          />

          {/* USER DETAILS */}
          <div className="leading-tight max-w-[80px] md:max-w-[130px] truncate">
            <div
              className="font-semibold text-gray-800 text-xs truncate"
              title={profile?.fullName || "Unknown User"}
            >
              {profile?.fullName || "Unknown User"}
            </div>

            <div
              className="text-[10px] text-gray-500 font-mono mt-0.5 truncate"
              title={profile?.email || tx.userId}
            >
              {profile?.email || tx.userId}
            </div>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-4 text-gray-600 capitalize">
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

      {/* Plan / Source */}
      <td className="py-3 px-4 text-gray-600">
        {isWithdraw ? tx.source || "—" : tx.plan || "—"}
      </td>

      {/* Amount + Credits */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="font-semibold text-primary">
          <Money amount={tx.amount} />
        </div>

        {tx.type === "topup" && tx.credits !== undefined && (
          <div className="text-xs text-blue-600 font-medium mt-1">
            + {tx.credits} credits
          </div>
        )}
      </td>

      {/* Method / Account */}
      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
        {isWithdraw ? (
          <div className="text-xs">
            <p className="font-medium">{tx.accountName || "—"}</p>
            <p className="relative flex items-center gap-1">
              No:
              {tx.accountNumber ? (
                <>
                  <button
                    onClick={() => handleCopy(String(tx.accountNumber))}
                    className="underline cursor-pointer text-primary text-[11px]"
                  >
                    {tx.accountNumber}
                  </button>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  {copied && (
                    <span className="absolute bg-black text-white text-[10px] px-2 py-1 rounded-md -top-5 left-1/2 -translate-x-1/2">
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

      {/* Date */}
      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
        {tx.createdAt ? new Date(tx.createdAt.toDate()).toLocaleString() : "—"}
      </td>

      {/* Transaction ID */}
      <td className="py-3 px-4 font-mono text-xs text-gray-600">
        {tx.transactionId || tx.id}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-center">
        {isPending ? (
          <div className="flex justify-center gap-2">
            <button
              onClick={onApprove}
              className="cursor-pointer px-3 py-1.5 text-xs bg-green-600 text-white rounded-md flex items-center gap-1 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={onReject}
              className="cursor-pointer px-3 py-1.5 text-xs bg-red-600 text-white rounded-md flex items-center gap-1 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md ${
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
