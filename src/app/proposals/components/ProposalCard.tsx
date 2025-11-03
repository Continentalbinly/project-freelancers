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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Unknown User");
  const [rating, setRating] = useState<number | null>(null);
  const [totalProjects, setTotalProjects] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();

  // ✅ Detect screen size (mobile vs desktop)
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔍 Fetch avatar + profile details
  useEffect(() => {
    const fetchProfileAvatar = async () => {
      try {
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
      } catch (err) {
        console.error("⚠️ Error fetching profile:", err);
      }
    };

    if (
      (activeTab === "submitted" && proposal.client?.avatar) ||
      (activeTab === "received" && proposal.freelancer?.avatar)
    ) {
      const userData =
        activeTab === "submitted" ? proposal.client : proposal.freelancer;
      setAvatarUrl(userData?.avatar || null);
      setDisplayName(userData?.fullName || "Unknown User");
      if (activeTab === "received") {
        setRating(userData?.rating || null);
        setTotalProjects(userData?.totalProjects || null);
      }
    } else {
      fetchProfileAvatar();
    }
  }, [proposal, activeTab]);

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
    const chatUrl = `/messages?project=${proposal.projectId}`;

    if (!isMobile) {
      // 💻 Desktop / Tablet → open inline chat in new tab
      e.preventDefault();
      window.open(chatUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // 📱 Mobile → directly open [id] route
    e.preventDefault();
    if (!user) return;

    try {
      setLoadingChat(true);
      const room = await createOrOpenChatRoom(proposal.projectId, user.uid);
      if (room?.id) {
        router.push(`/messages/${room.id}`); // ✅ goes straight to [id]
      }
    } catch (err) {
      console.error("❌ Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-border p-4 sm:p-6 transition-all hover:shadow-md">
      {/* === Header === */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
          <Avatar
            src={avatarUrl || undefined}
            alt={displayName}
            name={displayName}
            size="xl"
          />
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
                    className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
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
          className="text-xs sm:text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1 hover:underline"
        >
          <span className="w-1 h-3 bg-primary rounded-full"></span>
          {t("proposals.proposalCard.viewDetails")}
        </Link>

        <div className="flex gap-3">
          {proposal.status === "pending" && activeTab === "received" && (
            <>
              <button className="text-xs sm:text-sm text-success hover:text-success-dark font-semibold flex items-center gap-1 hover:underline">
                <span className="w-1 h-3 bg-success rounded-full"></span>
                {t("proposals.proposalCard.accept")}
              </button>
              <button className="text-xs sm:text-sm text-error hover:text-error-dark font-semibold flex items-center gap-1 hover:underline">
                <span className="w-1 h-3 bg-error rounded-full"></span>
                {t("proposals.proposalCard.reject")}
              </button>
            </>
          )}

          {proposal.status === "accepted" && (
            <Link
              href={`/messages?project=${proposal.projectId}`}
              onClick={handleStartChat}
              className={`btn btn-primary text-xs sm:text-sm shadow hover:shadow-md transition-all ${
                loadingChat ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              {loadingChat
                ? t("proposals.proposalCard.openingChat") || "Opening..."
                : t("proposals.proposalCard.startChat")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
