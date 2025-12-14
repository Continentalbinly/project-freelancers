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
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";

interface ProposalCardProps {
  proposal: any;
  activeTab: "submitted" | "received";
  t: any;
}

export default function ProposalCard({
  proposal,
  activeTab,
  t,
}: ProposalCardProps) {
  const { currentLanguage } = useTranslationContext();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();

  // ✅ Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔍 Fetch profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const userId = activeTab === "submitted"
          ? proposal.project?.clientId
          : proposal.freelancerId;

        if (!userId) return;

        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
          setProfileData(profileDoc.data());
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [proposal, activeTab]);

  // Get person data
  const person = profileData;

  // === STATUS HELPERS ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-success bg-success/10 border-success/30";
      case "rejected":
        return "text-error bg-error/10 border-error/30";
      case "pending":
        return "text-warning bg-warning/10 border-warning/30";
      default:
        return "text-text-secondary bg-background-secondary border-border";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return t("proposals.status.accepted");
      case "rejected":
        return t("proposals.status.rejected");
      case "pending":
        return t("proposals.status.pending");
      case "withdrawn":
        return t("proposals.status.withdrawn");
      default:
        return status;
    }
  };

  // ✅ Handle “Start Chat”
  const handleStartChat = async (e: React.MouseEvent) => {
    e.stopPropagation(); // ✅ Prevent triggering card click
    const chatUrl = `/messages?project=${proposal.projectId}`;

    if (!isMobile) {
      e.preventDefault();
      window.open(chatUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!user) return;

    try {
      setLoadingChat(true);
      const room = await createOrOpenChatRoom(proposal.projectId, user.uid);
      if (room?.id) {
        router.push(`/messages/${room.id}`);
      }
    } catch (err) {
      //console.error("❌ Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  /** ✅ Navigate to detail page when clicking card */
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent if clicked inside a button or link
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.tagName === "BUTTON"
    )
      return;
    router.push(`/proposals/${proposal.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-background rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 transition-all hover-surface cursor-pointer"
    >
      {/* === Header === */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
          {loadingProfile ? (
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
          ) : (
            <Avatar
              src={person?.avatarUrl || ""}
              alt={person?.fullName}
              name={person?.fullName}
              size="xl"
            />
          )}
          <div className="w-full sm:flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 line-clamp-2">
              {proposal.project?.title || "Untitled Project"}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-2 line-clamp-2">
              {proposal.project?.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {proposal.project?.skillsRequired
                ?.slice(0, 3)
                .map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              {proposal.project?.skillsRequired?.length > 3 && (
                <span className="px-2 py-1 bg-background-secondary text-text-secondary text-xs rounded-full">
                  +{proposal.project.skillsRequired.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status + Budget */}
        <div className="flex flex-col items-center lg:items-end gap-3">
          <span
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(
              proposal.status
            )}`}
          >
            {getStatusText(proposal.status)}
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

      {/* === Details === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* User */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold text-text-primary mb-1 text-sm flex items-center gap-1">
            <span className="w-1 h-3 bg-primary rounded-full"></span>
            {activeTab === "submitted"
              ? t("proposals.proposalCard.client")
              : t("proposals.proposalCard.freelancer")}
          </h4>
          <p className="text-xs text-text-secondary">
            {person?.fullName || "Unknown User"}
          </p>
          {activeTab === "received" && (
            <div className="flex items-center gap-2 mt-1">
              {person?.rating ? (
                <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                  <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
                  {person.rating.toFixed(1)}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {t("common.noRating")}
                </span>
              )}
              {person?.totalProjects !== null && person?.totalProjects !== undefined && (
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <BriefcaseIcon className="w-3 h-3 text-primary/60" />
                  {person.totalProjects}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold text-text-primary mb-1 text-sm flex items-center gap-1">
            <span className="w-1 h-3 bg-secondary rounded-full"></span>
            {t("proposals.proposalCard.duration")}
          </h4>
          <p className="text-xs text-text-secondary">
            {proposal.estimatedDuration || "-"}
          </p>
        </div>

        {/* Submitted Date */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold text-text-primary mb-1 text-sm flex items-center gap-1">
            <span className="w-1 h-3 bg-success rounded-full"></span>
            {t("proposals.proposalCard.submitted")}
          </h4>
          <p className="text-xs text-text-secondary">
            {timeAgo(
              proposal.createdAt?.toDate?.() || proposal.createdAt,
              currentLanguage
            )}
          </p>
        </div>

        {/* Work Samples */}
        <div className="bg-background-secondary rounded-xl p-3">
          <h4 className="font-semibold text-text-primary mb-1 text-sm flex items-center gap-1">
            <span className="w-1 h-3 bg-warning rounded-full"></span>
            {t("proposals.proposalCard.workSamples")}
          </h4>
          <p className="text-xs text-text-secondary">
            {proposal.workSamples?.length || 0} {t("common.samples")}
          </p>
        </div>
      </div>

      {/* === Actions === */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-border gap-3">
        <Link
          href={`/proposals/${proposal.id}`}
          onClick={(e) => e.stopPropagation()} // ✅ prevent double navigation
          className="text-xs sm:text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1 hover:underline"
        >
          <span className="w-1 h-3 bg-primary rounded-full"></span>
          {t("proposals.proposalCard.viewDetails")}
        </Link>

        <div className="flex gap-3">
          {proposal.status === "accepted" && (
            <button
              onClick={handleStartChat}
              className={`btn btn-primary text-xs sm:text-sm shadow hover:shadow-md transition-all ${
                loadingChat ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              {loadingChat
                ? t("proposals.proposalCard.openingChat") || "Opening..."
                : t("proposals.proposalCard.startChat")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
