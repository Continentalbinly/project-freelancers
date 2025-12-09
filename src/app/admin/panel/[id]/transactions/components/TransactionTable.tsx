"use client";

import TransactionRow from "./TransactionRow";
import TransactionCard from "./TransactionCard";
import type { Transaction, UserProfile } from "../page";

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
      <div className="py-20 text-center text-gray-500">
        No transactions found.
      </div>
    );

  return (
    <section className="py-10">
      <div className="max-w-8xl mx-auto px-4">
        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
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

            <tbody className="border border-border">
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

        {/* MOBILE CARDS */}
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
