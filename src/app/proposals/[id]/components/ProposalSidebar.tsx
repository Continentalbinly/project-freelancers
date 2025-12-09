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
import { db } from "@/service/firebase";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { toast } from "react-toastify";

export default function ProposalSidebar({ proposal, t, isClient }: any) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();

  const [loadingAction, setLoadingAction] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [confirmAction, setConfirmAction] = useState<
    "accept" | "reject" | null
  >(null);

  /** Fetch profile info **/
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

  /** =============================
   *  ACCEPT PROPOSAL
   * ============================= */
  const handleAccept = async () => {
    setLoadingAction(true);

    try {
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

      const userId = isClient
        ? proposal.project?.clientId
        : proposal.freelancerId;

      const room = await createOrOpenChatRoom(proposal.projectId, userId);

      toast.success(t("common.acceptSuccess"));

      router.push(
        room ? `/messages?project=${proposal.projectId}` : "/proposals"
      );
    } catch (err) {
      toast.error(t("common.acceptFailed"));
    } finally {
      setLoadingAction(false);
      setConfirmAction(null);
    }
  };

  /** =============================
   *  REJECT PROPOSAL + REFUND
   * ============================= */
  const handleReject = async () => {
    setLoadingAction(true);

    try {
      /** Load project fee */
      const projectSnap = await getDoc(doc(db, "projects", proposal.projectId));
      if (!projectSnap.exists()) throw new Error("Project missing.");

      const project = projectSnap.data();
      const refundAmount = project.postingFee ?? 0;
      const projectTitle = project.title ?? "Unknown Project";

      /** Load freelancer */
      const freelancerRef = doc(db, "profiles", proposal.freelancerId);
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
      const transactionRef = doc(collection(db, "transactions"));
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
      await updateDoc(doc(db, "proposals", proposal.id), {
        status: "rejected",
        refundedAmount: refundAmount,
        processedAt: serverTimestamp(),
      });

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
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 cursor-not-allowed"></div>
      )}

      {/* === Profile === */}
      <section className="border border-border bg-white/70 rounded-md p-5">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
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
      <section className="border border-border bg-white/70 rounded-md p-5 text-sm">
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
      <section className="border border-border bg-white/70 rounded-md p-5 space-y-3">
        {proposal.status === "pending" && isClient && (
          <>
            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("accept")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md flex justify-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              {t("proposals.detail.accept")}
            </button>

            <button
              disabled={loadingAction}
              onClick={() => setConfirmAction("reject")}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-md flex justify-center"
            >
              <XCircleIcon className="w-4 h-4 mr-1" />
              {t("proposals.detail.reject")}
            </button>
          </>
        )}

        {proposal.status === "accepted" && (
          <Link
            href={`/messages?project=${proposal.projectId}`}
            className="w-full bg-primary text-white py-2.5 rounded-md flex justify-center hover:bg-primary-dark"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
            {t("proposals.detail.startChat")}
          </Link>
        )}

        <Link
          href="/proposals"
          className="w-full py-2.5 text-sm rounded-md border border-border text-text-primary bg-white hover:bg-gray-50 flex justify-center gap-2"
        >
          ← {t("proposals.detail.backToList")}
        </Link>
      </section>

      {/* === Confirmation Modal === */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6 text-center">
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
                className="px-4 py-2 border border-border rounded-md text-sm hover:bg-background"
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
