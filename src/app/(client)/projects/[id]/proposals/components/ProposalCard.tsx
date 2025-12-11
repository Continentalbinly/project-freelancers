"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import Avatar from "@/app/utils/avatarHandler";
import { timeAgo } from "@/service/timeUtils";
import { formatEarnings } from "@/service/currencyUtils";
import { StarIcon, BriefcaseIcon } from "@heroicons/react/24/solid";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";
import type { ProposalWithDetails } from "@/types/proposal";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ProposalCardProps {
  proposal: ProposalWithDetails;
  activeTab: "submitted" | "received";
  t: (key: string) => string;
}

export default function ProposalCard({
  proposal,
  activeTab,
  t,
}: ProposalCardProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Unknown User");
  const [rating, setRating] = useState<number | null>(null);
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const { currentLanguage } = useTranslationContext();

  /** Load Profile */
  useEffect(() => {
    const fetchProfile = async () => {
      const profileId =
        activeTab === "submitted"
          ? proposal.client?.id || proposal.project?.clientId
          : proposal.freelancerId;

      if (!profileId) return;

      const snap = await getDoc(doc(db, "profiles", profileId));
      if (snap.exists()) {
        const data = snap.data();
        setAvatarUrl(data.avatarUrl || null);
        setDisplayName(data.fullName || "Unknown User");
        if (activeTab === "received") {
          setRating(data.rating || null);
          setTotalProjects(data.totalProjects || null);
        }
      }
    };

    fetchProfile();
  }, [proposal, activeTab]);

  /** Status Color */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-success bg-success/10 border-success/30";
      case "rejected":
        return "text-error bg-error/10 border-error/30";
      case "pending":
        return "text-warning bg-warning/10 border-warning/30";
      case "withdrawn":
        return "text-text-secondary bg-background-secondary border-border";
      default:
        return "text-text-secondary bg-background-secondary border-border";
    }
  };

  /** Chat Button Handler */
  const handleStartChat = async (e: any) => {
    e.stopPropagation(); // prevent triggering card click
    try {
      setLoadingAction(true);
      const currentUserId =
        activeTab === "received"
          ? proposal.project?.clientId
          : proposal.freelancerId;

      if (!currentUserId) return;

      const room = await createOrOpenChatRoom(
        proposal.projectId,
        currentUserId
      );
      if (room) router.push(`/messages?project=${proposal.projectId}`);
    } finally {
      setLoadingAction(false);
    }
  };

  /** ------------------------------------
   * Now clicking card navigates directly
   * ------------------------------------ */
  const navigateToDetails = () => {
    router.push(`/proposals/${proposal.id}`);
  };

  return (
    <div
      onClick={navigateToDetails}
      className="
        rounded-xl sm:rounded-2xl shadow-sm border border-border 
        p-4 sm:p-6 transition-all cursor-pointer
        hover:shadow-md hover:-translate-y-1
      "
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
          <Avatar
            src={avatarUrl || undefined}
            alt={displayName}
            name={displayName}
            size="xl"
          />

          <div className="w-full sm:flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold   mb-1 line-clamp-2">
              {proposal.project?.title || "Untitled Project"}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-2 line-clamp-2">
              {proposal.project?.description}
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {proposal.project?.skillsRequired?.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}

              {proposal.project?.skillsRequired &&
                proposal.project.skillsRequired.length > 3 && (
                  <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                    +{proposal.project.skillsRequired.length - 3} more
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* STATUS + BUDGET */}
        <div className="flex flex-col items-center lg:items-end gap-3">
          <span
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(
              proposal.status
            )}`}
          >
            {t(`proposals.status.${proposal.status}`)}
          </span>

          <div className="text-center lg:text-right">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {formatEarnings(proposal.proposedBudget)}
            </div>
            <div className="text-xs text-text-secondary">
              {t("proposals.proposalCard.proposedBudget")}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Freelancer / Client */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold   mb-1 text-sm">
            {activeTab === "submitted"
              ? t("proposals.proposalCard.client")
              : t("proposals.proposalCard.freelancer")}
          </h4>

          <p className="text-xs text-text-secondary">{displayName}</p>

          {activeTab === "received" && (
            <div className="flex items-center gap-2 mt-1">
              {rating ? (
                <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                  <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
                  {rating.toFixed(1)}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {t("common.noRating")}
                </span>
              )}

              {totalProjects !== null && (
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <BriefcaseIcon className="w-3 h-3 text-primary/60" />
                  {totalProjects}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold   mb-1 text-sm">
            {t("proposals.proposalCard.duration")}
          </h4>
          <p className="text-xs text-text-secondary">
            {proposal.estimatedDuration || "-"}
          </p>
        </div>

        {/* Submitted */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold   mb-1 text-sm">
            {t("proposals.proposalCard.submitted")}
          </h4>
          <p className="text-xs text-text-secondary">
            {timeAgo(
              proposal.createdAt instanceof Date
                ? proposal.createdAt
                : proposal.createdAt?.toDate?.() || new Date(),
              currentLanguage
            )}
          </p>
        </div>

        {/* Work Samples */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold   mb-1 text-sm">
            {t("proposals.proposalCard.workSamples")}
          </h4>
          <p className="text-xs text-text-secondary">
            {proposal.workSamples?.length || 0} {t("common.samples")}
          </p>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-border gap-3">
        {/* View Details Link */}
        <Link
          href={`/proposals/${proposal.id}`}
          onClick={(e) => e.stopPropagation()} // prevent triggering card click
          className="text-xs sm:text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
        >
          <span className="w-1 h-3 bg-primary rounded-full"></span>
          {t("proposals.proposalCard.viewDetails")}
        </Link>

        {/* Chat Button */}
        {proposal.status === "accepted" && (
          <button
            onClick={handleStartChat}
            disabled={loadingAction}
            className="btn btn-primary text-xs sm:text-sm shadow hover:shadow-md transition-all"
          >
            {loadingAction
              ? t("common.loading")
              : t("proposals.proposalCard.startChat")}
          </button>
        )}
      </div>
    </div>
  );
}
