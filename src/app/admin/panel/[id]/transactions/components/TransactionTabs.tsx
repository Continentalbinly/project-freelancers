"use client";

import { useRouter, useParams } from "next/navigation";

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function TransactionTabs({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const router = useRouter();
  const { id } = useParams();

  function handleClick(tab: string) {
    router.push(`/admin/panel/${id}/transactions?status=${tab}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10">
      <div className="flex gap-3 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleClick(t.key)}
            className={`pb-2 px-3 text-sm font-medium transition-colors ${
              currentStatus === t.key
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
