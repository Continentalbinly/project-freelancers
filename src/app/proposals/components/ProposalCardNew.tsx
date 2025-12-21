"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import Avatar from "@/app/utils/avatarHandler";
import { timeAgo } from "@/service/timeUtils";
import { formatEarnings } from "@/service/currencyUtils";
import {
  BriefcaseIcon,
  ClockIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";

interface ProposalCardNewProps {
  proposal: any;
  activeTab: "submitted" | "received";
  t: any;
}

export default function ProposalCardNew({
  proposal,
  activeTab,
  t,
}: ProposalCardNewProps) {
  const { currentLanguage } = useTranslationContext();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const userId = activeTab === "submitted"
          ? proposal.project?.clientId
          : proposal.freelancerId;

        if (!userId) return;
        const firestore = requireDb();
        const profileDoc = await getDoc(doc(firestore, "profiles", userId));
        if (profileDoc.exists()) {
          setProfileData(profileDoc.data());
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [proposal, activeTab]);

  const person = profileData;

  // Status helpers
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return {
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: CheckCircleIcon,
          text: t("proposals.status.accepted"),
        };
      case "rejected":
        return {
          color: "bg-red-500/10 text-red-600 border-red-500/20",
          icon: XCircleIcon,
          text: t("proposals.status.rejected"),
        };
      case "pending":
        return {
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          icon: ClockIcon,
          text: t("proposals.status.pending"),
        };
      case "withdrawn":
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          icon: XCircleIcon,
          text: t("proposals.status.withdrawn"),
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          icon: ClockIcon,
          text: status,
        };
    }
  };

  const statusConfig = getStatusConfig(proposal.status);
  const StatusIcon = statusConfig.icon;

  // Handle Start Chat
  const handleStartChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      console.error("Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Navigate to detail page
  const handleCardClick = (e: React.MouseEvent) => {
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
      className="group bg-background rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Card Header with Gradient */}
      <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Avatar and User Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {loadingProfile ? (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse flex-shrink-0" />
            ) : (
              <div className="flex-shrink-0">
                <Avatar
                  src={person?.avatarUrl || ""}
                  alt={person?.fullName}
                  name={person?.fullName}
                  size="xl"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {proposal.project?.title || "Untitled Project"}
              </h3>
              <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                {proposal.project?.description || t("proposals.proposalCard.noDescription")}
              </p>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">
                  {person?.fullName || "Unknown User"}
                </span>
                {activeTab === "received" && person?.rating && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <StarIcon className="w-3.5 h-3.5 fill-current" />
                    {person.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Status Badge */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.text}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {formatEarnings(proposal.proposedBudget)}
              </div>
              <div className="text-xs text-text-secondary">
                {t("proposals.proposalCard.proposedBudget")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-4">
        {/* Skills Tags */}
        {proposal.project?.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {proposal.project.skillsRequired.slice(0, 4).map((skill: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
              >
                {skill}
              </span>
            ))}
            {proposal.project.skillsRequired.length > 4 && (
              <span className="px-3 py-1 bg-background-secondary text-text-secondary text-xs font-medium rounded-full border border-border">
                +{proposal.project.skillsRequired.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Duration */}
          <div className="bg-background-secondary rounded-xl p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-text-primary text-xs">
                {t("proposals.proposalCard.duration")}
              </h4>
            </div>
            <p className="text-sm text-text-secondary">
              {proposal.estimatedDuration || "-"}
            </p>
          </div>

          {/* Submitted Date */}
          <div className="bg-background-secondary rounded-xl p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="w-4 h-4 text-secondary" />
              <h4 className="font-semibold text-text-primary text-xs">
                {t("proposals.proposalCard.submitted")}
              </h4>
            </div>
            <p className="text-sm text-text-secondary">
              {timeAgo(
                proposal.createdAt?.toDate?.() || proposal.createdAt,
                currentLanguage
              )}
            </p>
          </div>

          {/* Work Samples */}
          <div className="bg-background-secondary rounded-xl p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <PhotoIcon className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-text-primary text-xs">
                {t("proposals.proposalCard.workSamples")}
              </h4>
            </div>
            <p className="text-sm text-text-secondary">
              {proposal.workSamples?.length || 0} {t("common.samples")}
            </p>
          </div>

          {/* Projects Completed (for received tab) */}
          {activeTab === "received" && (
            <div className="bg-background-secondary rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <BriefcaseIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("proposals.proposalCard.projects")}
                </h4>
              </div>
              <p className="text-sm text-text-secondary">
                {person?.totalProjects || 0}
              </p>
            </div>
          )}

          {/* Client Info (for submitted tab) */}
          {activeTab === "submitted" && (
            <div className="bg-background-secondary rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <BriefcaseIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("proposals.proposalCard.client")}
                </h4>
              </div>
              <p className="text-sm text-text-secondary line-clamp-1">
                {person?.fullName || "Unknown"}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-border">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/proposals/${proposal.id}`);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/btn"
          >
            <span>{t("proposals.proposalCard.viewDetails")}</span>
          </button>

          {proposal.status === "accepted" && (
            <button
              onClick={handleStartChat}
              disabled={loadingChat}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-sm hover:shadow-md ${
                loadingChat ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>
                {loadingChat
                  ? t("proposals.proposalCard.openingChat") || "Opening..."
                  : t("proposals.proposalCard.startChat")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

