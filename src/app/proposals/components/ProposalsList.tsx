"use client";
import ProposalCardNew from "./ProposalCardNew";
import type { ProposalWithDetails } from "@/types/proposal";

interface ProposalsListProps {
  proposals: ProposalWithDetails[];
  activeTab: "submitted" | "received";
  t: (key: string) => string;
}

export default function ProposalsList({ proposals, activeTab, t }: ProposalsListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {proposals.map((proposal) => (
        <ProposalCardNew
          key={proposal.id}
          proposal={proposal}
          activeTab={activeTab}
          t={t}
        />
      ))}
    </div>
  );
}
