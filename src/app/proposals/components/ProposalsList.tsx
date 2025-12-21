"use client";
import ProposalCardNew from "./ProposalCardNew";

export default function ProposalsList({ proposals, activeTab, t }: any) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {proposals.map((proposal: any) => (
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
