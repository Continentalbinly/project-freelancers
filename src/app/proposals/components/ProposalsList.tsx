"use client";
import ProposalCard from "./ProposalCard";

export default function ProposalsList({ proposals, activeTab, t }: any) {
  return (
    <div className="space-y-4">
      {proposals.map((proposal: any) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          activeTab={activeTab}
          t={t}
        />
      ))}
    </div>
  );
}
