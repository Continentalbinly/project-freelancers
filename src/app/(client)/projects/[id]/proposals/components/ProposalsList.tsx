"use client";
import ProposalCard from "./ProposalCard";
import type { ProposalWithDetails } from "@/types/proposal";

interface ProposalsListProps {
  proposals: ProposalWithDetails[];
  loading: boolean;
  activeTab: "submitted" | "received";
  t: (key: string) => string;
  onAccept?: (p: ProposalWithDetails) => void;
  onReject?: (p: ProposalWithDetails) => void;
  onSelect?: (p: ProposalWithDetails) => void;
}

export default function ProposalsList({
  proposals,
  loading,
  activeTab,
  t,
  onAccept,
  onReject,
  onSelect,
}: ProposalsListProps) {
  if (loading)
    return (
      <div className="text-center py-10 text-text-secondary">
        Loading proposals...
      </div>
    );

  if (!proposals.length)
    return (
      <div className="text-center py-12 rounded-xl border border-border">
        <p className="text-text-secondary">No proposals found.</p>
      </div>
    );

  return (
    <div className="rounded-xl border border-border shadow-sm">
      <div className="p-6 space-y-6">
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            activeTab={activeTab}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
