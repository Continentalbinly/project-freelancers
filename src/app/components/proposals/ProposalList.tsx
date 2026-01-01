"use client";

import ProposalListItem from "./ProposalListItem";
import ProposalListItemSkeleton from "./ProposalListItemSkeleton";
import type { ProposalWithDetails } from "@/types/proposal";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import EmptyState from "../ui/EmptyState";

interface ProposalListProps {
  proposals: ProposalWithDetails[];
  loading?: boolean;
  role: "client" | "freelancer";
  context: "project" | "global";
  showProjectTitle?: boolean;
  onSelect?: (proposal: ProposalWithDetails) => void;
  onAccept?: (proposal: ProposalWithDetails) => void;
  onReject?: (proposal: ProposalWithDetails) => void;
}

export default function ProposalList({
  proposals,
  loading = false,
  role,
  context,
  showProjectTitle = false,
  onSelect,
  onAccept,
  onReject,
}: ProposalListProps) {
  const { t } = useTranslationContext();

  if (loading) {
    return (
      <div className="rounded-xl border border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/30 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <ProposalListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background-secondary">
        <EmptyState
          title={t("proposals.empty.title") || "No proposals found"}
          description={
            t("proposals.empty.description") ||
            "There are no proposals to display at this time."
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/30 overflow-hidden">
      {proposals.map((proposal, index) => (
        <ProposalListItem
          key={proposal.id}
          proposal={proposal}
          role={role}
          context={context}
          showProjectTitle={showProjectTitle}
          onSelect={onSelect}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

