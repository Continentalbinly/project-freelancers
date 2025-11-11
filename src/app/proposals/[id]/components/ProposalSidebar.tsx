"use client";

import {
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  UserIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import { timeAgo } from "@/service/timeUtils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/service/firebase";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils"; // ✅ added
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function ProposalSidebar({ proposal, t, isClient }: any) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();
  const [loadingAction, setLoadingAction] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [confirmAction, setConfirmAction] = useState<
    "accept" | "reject" | null
  >(null);

  // === Fetch profile ===
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const userId = isClient
          ? proposal.freelancerId
          : proposal.project?.clientId;
        if (!userId) return;
        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) setProfileData(profileDoc.data());
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [proposal, isClient]);

  // === Accept proposal + auto-create chat ===
  const handleAccept = async () => {
    try {
      setLoadingAction(true);

      // ✅ Update proposal & project status
      await updateDoc(doc(db, "proposals", proposal.id), {
        status: "accepted",
        processedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "projects", proposal.projectId), {
        acceptedFreelancerId: proposal.freelancerId,
        acceptedProposalId: proposal.id,
        status: "in_progress",
        updatedAt: serverTimestamp(),
      });

      // ✅ Create or reuse chat room
      const currentUserId = isClient
        ? proposal.project?.clientId
        : proposal.freelancerId;

      if (!currentUserId) {
        console.error("❌ Missing user ID — cannot create chat room");
        alert("Failed to create chat. Missing user ID.");
        return;
      }

      const room = await createOrOpenChatRoom(
        proposal.projectId,
        currentUserId
      );
      if (room) {
        alert("✅ Proposal accepted! Chat room ready.");
        router.push(`/messages?project=${proposal.projectId}`);
      } else {
        alert("⚠️ Proposal accepted, but chat room could not be created.");
      }
    } catch (err) {
      console.error("❌ Failed to accept proposal:", err);
      alert("❌ Failed to accept the proposal.");
    } finally {
      setLoadingAction(false);
      setConfirmAction(null);
    }
  };

  // === Reject proposal ===
  const handleReject = async () => {
    try {
      setLoadingAction(true);
      await updateDoc(doc(db, "proposals", proposal.id), {
        status: "rejected",
        processedAt: serverTimestamp(),
      });
      alert("🚫 Proposal rejected.");
      window.location.reload();
    } catch {
      alert("❌ Failed to reject proposal.");
    } finally {
      setLoadingAction(false);
      setConfirmAction(null);
    }
  };

  const person =
    profileData || (isClient ? proposal.freelancer : proposal.client);

  return (
    <aside className="space-y-5">
      {/* === Profile Section === */}
      <section className="border border-border bg-white/70 backdrop-blur rounded-md p-5">
        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-primary" />
          {isClient
            ? t("proposals.detail.freelancer")
            : t("proposals.detail.client")}
        </h3>

        {loadingProfile ? (
          <div className="animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/3"></div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Avatar
              src={person?.avatarUrl || "/default-avatar.png"}
              alt={person?.fullName || "User"}
              name={person?.fullName || "User"}
              size="lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-text-primary">
                {person?.fullName}
              </h4>
              {person?.rating ? (
                <p className="text-xs text-yellow-600">
                  ⭐ {person.rating.toFixed(1)} / 5
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">No ratings yet</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* === Proposal Details === */}
      <section className="border border-border bg-white/70 backdrop-blur rounded-md p-5 text-sm">
        <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
          <CurrencyDollarIcon className="w-4 h-4 text-primary" />
          {t("proposals.detail.details")}
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t("proposals.detail.budget")}</span>
            <span className="font-semibold text-primary">
              {formatEarnings(proposal.proposedBudget)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("proposals.detail.duration")}</span>
            <span>{proposal.estimatedDuration}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("proposals.detail.submitted")}</span>
            <span>{timeAgo(proposal.createdAt?.toDate?.() || new Date(), currentLanguage)}</span>
          </div>
        </div>
      </section>

      {/* === Actions === */}
      <section className="border border-border bg-white/70 backdrop-blur rounded-md p-5 space-y-3">
        {proposal.status === "pending" && isClient && (
          <>
            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("accept")}
              className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center"
            >
              {loadingAction && confirmAction === "accept" ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
              ) : (
                <CheckCircleIcon className="w-4 h-4 mr-1" />
              )}
              {t("proposals.detail.accept")}
            </button>

            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("reject")}
              className="w-full cursor-pointer bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center"
            >
              {loadingAction && confirmAction === "reject" ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
              ) : (
                <XCircleIcon className="w-4 h-4 mr-1" />
              )}
              {t("proposals.detail.reject")}
            </button>
          </>
        )}

        {proposal.status === "accepted" && (
          <Link
            href={`/messages?project=${proposal.projectId}`}
            className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium text-center flex items-center justify-center hover:bg-primary-dark transition-all"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            {t("proposals.detail.startChat")}
          </Link>
        )}

        {/* === Back to Proposals Button === */}
        <Link
          href="/proposals"
          className="w-full py-2.5 rounded-md text-sm font-medium text-center
                     border border-border text-text-primary 
                     bg-white hover:bg-gray-50 
                     transition-all duration-200 
                     shadow-sm hover:shadow
                     flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("proposals.detail.backToList")}
        </Link>
      </section>

      {/* === Confirmation Modal === */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6 text-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-warning mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              {confirmAction === "accept"
                ? t("proposals.confirmAcceptTitle")
                : t("proposals.confirmRejectTitle")}
            </h4>
            <p className="text-sm text-text-secondary mb-5">
              {confirmAction === "accept"
                ? t("proposals.confirmAcceptDesc")
                : t("proposals.confirmRejectDesc")}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-border rounded-md text-sm hover:bg-background transition"
              >
                {t("common.cancel")}
              </button>

              <button
                disabled={loadingAction}
                onClick={
                  confirmAction === "accept" ? handleAccept : handleReject
                }
                className={`px-4 py-2 rounded-md text-sm text-white ${
                  confirmAction === "accept"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loadingAction ? t("common.processing") : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
