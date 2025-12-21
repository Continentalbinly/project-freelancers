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
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  setDoc,
  increment,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { toast } from "react-toastify";
import { 
  createProposalAcceptedNotification, 
  createProposalRejectedNotification 
} from "@/app/orders/utils/notificationService";

export default function ProposalSidebar({ proposal, t, isClient }: any) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();

  const [loadingAction, setLoadingAction] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [confirmAction, setConfirmAction] = useState<
    "accept" | "reject" | null
  >(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  /** Detect screen size **/
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /** Fetch profile info **/
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const userId = isClient
          ? proposal.freelancerId
          : proposal.project?.clientId;

        if (!userId) return;
        const firestore = requireDb();

        const profileDoc = await getDoc(doc(firestore, "profiles", userId));
        if (profileDoc.exists()) setProfileData(profileDoc.data());
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [proposal, isClient]);

  /** =============================
   *  ACCEPT PROPOSAL
   * ============================= */
  const handleAccept = async () => {
    setLoadingAction(true);

    try {
      const firestore = requireDb();
      // Get project title for notification
      const projectSnap = await getDoc(doc(firestore, "projects", proposal.projectId));
      const projectTitle = projectSnap.exists() 
        ? (projectSnap.data().title ?? "Unknown Project")
        : "Unknown Project";
      
      const clientId = proposal.project?.clientId || (projectSnap.exists() ? projectSnap.data().clientId : null);

      await updateDoc(doc(firestore, "proposals", proposal.id), {
        status: "accepted",
        processedAt: serverTimestamp(),
      });

      await updateDoc(doc(firestore, "projects", proposal.projectId), {
        acceptedFreelancerId: proposal.freelancerId,
        acceptedProposalId: proposal.id,
        status: "in_progress",
        updatedAt: serverTimestamp(),
      });

      // Create notification for freelancer
      if (clientId) {
        try {
          await createProposalAcceptedNotification(
            clientId,
            proposal.freelancerId,
            proposal.projectId,
            projectTitle,
            proposal.id
          );
        } catch (notifError) {
          console.error("Error creating proposal accepted notification:", notifError);
        }
      }

      toast.success(t("common.acceptSuccess"));
      router.push(`/messages?project=${proposal.projectId}`);
    } catch (err) {
      toast.error(t("common.acceptFailed"));
    } finally {
      setLoadingAction(false);
      setConfirmAction(null);
    }
  };

  /** =============================
   *  START CHAT
   * ============================= */
  const handleStartChat = async (e: React.MouseEvent) => {
    e.preventDefault();
    const chatUrl = `/messages?project=${proposal.projectId}`;

    if (!isMobile) {
      window.open(chatUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setLoadingChat(true);
      const userId = isClient
        ? proposal.project?.clientId
        : proposal.freelancerId;
      const room = await createOrOpenChatRoom(proposal.projectId, userId);
      if (room?.id) {
        router.push(`/messages/${room.id}`);
      }
    } catch (err) {
      //console.error("❌ Error opening chat:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  /** =============================
   *  REJECT PROPOSAL + REFUND
   * ============================= */
  const handleReject = async () => {
    setLoadingAction(true);

    try {
      const firestore = requireDb();
      /** Load project fee */
      const projectSnap = await getDoc(doc(firestore, "projects", proposal.projectId));
      if (!projectSnap.exists()) throw new Error("Project missing.");

      const project = projectSnap.data();
      const refundAmount = project.postingFee ?? 0;
      const projectTitle = project.title ?? "Unknown Project";

      /** Load freelancer */
      const freelancerRef = doc(firestore, "profiles", proposal.freelancerId);
      const freelancerSnap = await getDoc(freelancerRef);

      if (!freelancerSnap.exists()) throw new Error("Freelancer not found");

      const freelancerData = freelancerSnap.data();
      const previousBalance = freelancerData.credit ?? 0;
      const newBalance = previousBalance + refundAmount;

      /** Update credit */
      await updateDoc(freelancerRef, {
        credit: increment(refundAmount),
      });

      /** Save transaction */
      const transactionRef = doc(collection(firestore, "transactions"));
      await setDoc(transactionRef, {
        id: transactionRef.id,
        userId: proposal.freelancerId,
        projectId: proposal.projectId,
        type: "proposal_refund",
        direction: "in",
        amount: refundAmount,
        previousBalance,
        newBalance,
        currency: "LAK",
        status: "completed",
        description: `Refund for rejected proposal on project "${projectTitle}"`,
        createdAt: serverTimestamp(),
      });

      /** Update proposal */
      await updateDoc(doc(firestore, "proposals", proposal.id), {
        status: "rejected",
        refundedAmount: refundAmount,
        processedAt: serverTimestamp(),
      });

      // Create notification for freelancer about rejection and refund
      const clientId = project.clientId;
      if (clientId) {
        try {
          await createProposalRejectedNotification(
            clientId,
            proposal.freelancerId,
            proposal.projectId,
            projectTitle,
            proposal.id,
            refundAmount
          );
        } catch (notifError) {
          console.error("Error creating proposal rejected notification:", notifError);
        }
      }

      toast.success(t("common.rejectSuccess"));
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error(t("common.rejectFailed"));
    } finally {
      setLoadingAction(false);
      setConfirmAction(null);
    }
  };

  const person =
    profileData || (isClient ? proposal.freelancer : proposal.client);

  return (
    <aside className="space-y-5 relative">
      {/* Disable entire sidebar while loading */}
      {loadingAction && (
        <div className="absolute inset-0 backdrop-blur-sm z-50 cursor-not-allowed"></div>
      )}

      {/* === Profile === */}
      <section className="border border-border  rounded-md p-5">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-primary" />
          {isClient
            ? t("proposals.detail.freelancer")
            : t("proposals.detail.client")}
        </h3>

        {loadingProfile ? (
          <div className="animate-pulse">
            <div className="w-14 h-14 rounded-full mb-3"></div>
            <div className="h-3 rounded w-1/2 mb-2"></div>
            <div className="h-2 rounded w-1/3"></div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Avatar
              src={person?.avatarUrl || "/default-avatar.png"}
              alt={person?.fullName}
              name={person?.fullName}
              size="lg"
            />

            <div className="flex-1">
              <h4 className="font-medium">{person?.fullName}</h4>

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
      <section className="border border-border  rounded-md p-5 text-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
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
            <span>
              {timeAgo(
                proposal.createdAt?.toDate?.() || new Date(),
                currentLanguage
              )}
            </span>
          </div>
        </div>
      </section>

      {/* === Actions === */}
      <section className="border border-border  rounded-md p-5 space-y-3">
        {proposal.status === "pending" && isClient && (
          <>
            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("accept")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>{t("proposals.detail.accept")}</span>
            </button>

            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("reject")}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-md flex items-center justify-center gap-2"
            >
              <XCircleIcon className="w-5 h-5" />
              <span>{t("proposals.detail.reject")}</span>
            </button>
          </>
        )}

        {proposal.status === "accepted" && (
          <button
            onClick={handleStartChat}
            disabled={loadingChat}
            className={`w-full bg-primary text-white py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-primary-hover ${
              loadingChat ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span>{loadingChat ? (t("proposals.proposalCard.openingChat") || "Opening...") : t("proposals.detail.startChat")}</span>
          </button>
        )}

        <Link
          href="/proposals"
          className="w-full py-2.5 text-sm rounded-md border border-border  flex justify-center gap-2"
        >
          ← {t("proposals.detail.backToList")}
        </Link>
      </section>

      {/* === Confirmation Modal === */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className=" rounded-lg shadow-xl border border-border w-[90%] max-w-sm p-6 text-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-warning mx-auto mb-3" />

            <h4 className="text-lg font-semibold mb-2">
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
                disabled={loadingAction}
                onClick={() => !loadingAction && setConfirmAction(null)}
                className="px-4 py-2 border border-border rounded-md text-sm "
              >
                {t("common.cancel")}
              </button>

              <button
                disabled={loadingAction}
                onClick={
                  confirmAction === "accept" ? handleAccept : handleReject
                }
                className={`px-4 py-2 text-sm text-white rounded-md flex items-center justify-center ${
                  confirmAction === "accept" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {loadingAction && (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2" />
                )}

                {loadingAction ? t("common.processing") : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
