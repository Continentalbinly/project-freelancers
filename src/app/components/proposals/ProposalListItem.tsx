"use client";

import { useRouter } from "next/navigation";
import Avatar from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import { getStatusConfig, formatProposalTime, getFreelancerName, getProjectTitle } from "./proposalUi";
import type { ProposalWithDetails } from "@/types/proposal";
import Button from "@/app/components/ui/Button";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ProposalListItemProps {
  proposal: ProposalWithDetails;
  role: "client" | "freelancer";
  context: "project" | "global";
  showProjectTitle?: boolean;
  onSelect?: (proposal: ProposalWithDetails) => void;
  onAccept?: (proposal: ProposalWithDetails) => void;
  onReject?: (proposal: ProposalWithDetails) => void;
}

export default function ProposalListItem({
  proposal,
  role,
  context,
  showProjectTitle = false,
  onSelect,
  onAccept,
  onReject,
}: ProposalListItemProps) {
  const router = useRouter();
  const { currentLanguage, t } = useTranslationContext();
  const statusConfig = getStatusConfig(proposal.status);
  const freelancerName = getFreelancerName(proposal);
  const projectTitle = getProjectTitle(proposal);

  const handleClick = () => {
    // Always navigate to detail page, never open modal
    router.push(`/proposals/${proposal.id}`);
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAccept) {
      onAccept(proposal);
    }
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReject) {
      onReject(proposal);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always navigate to detail page
    router.push(`/proposals/${proposal.id}`);
  };

  const handleGoToWorkroom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (proposal.projectId) {
      router.push(`/my-projects/${proposal.projectId}/progress`);
    }
  };

  // Determine which actions to show
  const showActions = role === "client" && context === "project";
  const isPending = proposal.status === "pending";
  const isAccepted = proposal.status === "accepted";

  return (
    <div
      onClick={handleClick}
      className="px-3 sm:px-4 py-3 hover:bg-background-tertiary dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-t border-border/60 dark:border-gray-700/60 first:border-t-0"
    >
      {/* Desktop Layout: Single Row */}
      <div className="hidden md:flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar
            src={proposal.freelancer?.avatar || undefined}
            alt={freelancerName}
            name={freelancerName}
            size="sm"
          />
        </div>

        {/* Left: Name, Project Title (if global), Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="font-medium text-text-primary truncate">
              {freelancerName}
            </div>
            {showProjectTitle && (
              <div className="text-sm text-text-secondary truncate">
                {projectTitle}
              </div>
            )}
          </div>
          <div className="text-xs text-text-secondary mt-0.5">
            {formatProposalTime(proposal.createdAt, currentLanguage)}
          </div>
        </div>

        {/* Middle: Budget + Duration */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="text-sm font-semibold text-text-primary">
            {formatEarnings(proposal.proposedBudget)}
          </div>
          {proposal.estimatedDuration && (
            <div className="text-xs text-text-secondary">
              {proposal.estimatedDuration}
            </div>
          )}
        </div>

        {/* Right: Status Badge + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}
          >
            {t(`proposals.status.${proposal.status}`) || statusConfig.label}
          </span>

          {showActions && isPending && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAccept}
                className="whitespace-nowrap"
              >
                {t("proposals.actions.accept") || "Accept"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="whitespace-nowrap"
              >
                {t("proposals.actions.reject") || "Reject"}
              </Button>
            </div>
          )}

          {showActions && !isPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="whitespace-nowrap"
            >
              {t("proposals.actions.view") || "View"}
            </Button>
          )}

          {role === "freelancer" && isAccepted && proposal.projectId && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGoToWorkroom}
              className="whitespace-nowrap"
            >
              {t("proposals.actions.goToWorkroom") || "Go to Workroom"}
            </Button>
          )}

          {role === "freelancer" && !isAccepted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="whitespace-nowrap"
            >
              {t("proposals.actions.view") || "View"}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Top Line: Avatar + Name/Title */}
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <Avatar
              src={proposal.freelancer?.avatar || undefined}
              alt={freelancerName}
              name={freelancerName}
              size="sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-text-primary truncate">
              {freelancerName}
            </div>
            {showProjectTitle && (
              <div className="text-xs text-text-secondary truncate mt-0.5">
                {projectTitle}
              </div>
            )}
            <div className="text-xs text-text-secondary mt-1">
              {formatProposalTime(proposal.createdAt, currentLanguage)}
            </div>
          </div>
        </div>

        {/* Middle: Budget + Duration */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-sm font-semibold text-text-primary">
            {formatEarnings(proposal.proposedBudget)}
          </div>
          {proposal.estimatedDuration && (
            <div className="text-xs text-text-secondary">
              {proposal.estimatedDuration}
            </div>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className} ml-auto`}
          >
            {t(`proposals.status.${proposal.status}`) || statusConfig.label}
          </span>
        </div>

        {/* Bottom: Actions */}
        {(showActions || role === "freelancer") && (
          <div className="flex items-center gap-2 flex-wrap">
            {showActions && isPending && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 min-w-[80px] text-xs"
                >
                  {t("proposals.actions.accept") || "Accept"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  className="flex-1 min-w-[80px] text-xs"
                >
                  {t("proposals.actions.reject") || "Reject"}
                </Button>
              </>
            )}

            {showActions && !isPending && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex-1 min-w-[80px] text-xs"
              >
                {t("proposals.actions.view") || "View"}
              </Button>
            )}

            {role === "freelancer" && isAccepted && proposal.projectId && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGoToWorkroom}
                className="flex-1 min-w-[100px] text-xs"
              >
                {t("proposals.actions.goToWorkroom") || "Workroom"}
              </Button>
            )}

            {role === "freelancer" && !isAccepted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex-1 min-w-[80px] text-xs"
              >
                {t("proposals.actions.view") || "View"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

