"use client";

import TransactionRow from "./TransactionRow";
import type { Transaction, UserProfile } from "../page";
import TransactionCard from "./TransactionCard"; // 👈 new component

export default function TransactionTable({
  transactions,
  userProfiles,
  onApprove,
  onReject,
}: {
  transactions: Transaction[];
  userProfiles: Record<string, UserProfile>;
  onApprove: (tx: Transaction) => void;
  onReject: (tx: Transaction) => void;
}) {
  if (transactions.length === 0)
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-gray-500">
        No transactions found.
      </div>
    );

  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🖥️ Table for desktop / tablet */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-700">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Plan</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Method / Account</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  profile={userProfiles[tx.userId]}
                  onApprove={() => onApprove(tx)}
                  onReject={() => onReject(tx)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 Card View for Mobile */}
        <div className="sm:hidden space-y-4">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              profile={userProfiles[tx.userId]}
              onApprove={() => onApprove(tx)}
              onReject={() => onReject(tx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
