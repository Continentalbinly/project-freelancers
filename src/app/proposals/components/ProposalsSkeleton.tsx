"use client";
import ProposalListItemSkeleton from "@/app/components/proposals/ProposalListItemSkeleton";

export default function ProposalsSkeleton() {
  return (
    <div className="rounded-xl border border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/30 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <ProposalListItemSkeleton key={i} />
      ))}
    </div>
  );
}
