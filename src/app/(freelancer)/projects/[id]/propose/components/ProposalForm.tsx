"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as FirebaseUser } from "firebase/auth";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { Project } from "@/types/project";
import { Profile } from "@/types/profile";
import { Milestone } from "@/types/proposal";

// Form-specific types (simpler than full types for UI state)
interface WorkSampleForm {
  id: string;
  url: string;
  type: string;
  title: string;
  publicId?: string;
}
import WorkSamples from "./WorkSamples";
import Milestones from "./Milestones";
import ProposalSummary from "./ProposalSummary";
import { Dialog } from "@headlessui/react";
import { createProposalSubmittedNotification } from "@/app/orders/utils/notificationService";
import { toast } from "react-toastify";

interface ProposalFormProps {
  project: Project;
  user: FirebaseUser;
  profile: Profile | null;
  t: (key: string) => string;
  proposalFee: number;
}

export default function ProposalForm({
  project,
  user,
  profile,
  t,
  proposalFee,
}: ProposalFormProps) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget] = useState(project.budget?.toString() || "");
  const [proposedRate, setProposedRate] = useState(
    project.budgetType === "hourly" ? "15000" : ""
  );
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [workPlan, setWorkPlan] = useState("");
  const [workSamples, setWorkSamples] = useState<WorkSampleForm[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const freelancerCredit = profile?.credit ?? 0;
  const canSubmit = freelancerCredit >= proposalFee;

  // -------------------------------------------------
  // 🔍 VALIDATION (improved — only checks required fields)
  // -------------------------------------------------
  const validateForm = () => {
    if (!coverLetter.trim()) {
      toast.error(t("proposePage.coverLetterRequired"));
      return false;
    }

    if (!estimatedDuration) {
      toast.error(t("proposePage.durationRequired"));
      return false;
    }

    if (
      project.budgetType === "hourly" &&
      (!proposedRate || proposedRate === "0")
    ) {
      toast.error(
        t("proposePage.hourlyRateLabel") + " " + t("common.isRequired")
      );
      return false;
    }

    return true;
  };

  // -------------------------------------------------
  // 🔥 FINAL SUBMIT HANDLER
  // -------------------------------------------------
  const handleFinalSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      if (!db) {
        setError("Database not available");
        return;
      }
      const proposalRef = doc(collection(db, "proposals"));
      const proposalId = proposalRef.id;

      await setDoc(proposalRef, {
        id: proposalId,
        projectId: project.id,
        freelancerId: user.uid,
        coverLetter,
        proposedBudget: Number(proposedBudget),
        proposedRate:
          project.budgetType === "hourly" ? Number(proposedRate) : null,
        estimatedDuration,
        workPlan,
        milestones,
        workSamples: workSamples.map((s) => ({
          title: s.title,
          url: s.url,
          type: s.type,
          description: "",
          uploadedAt: new Date(),
          ...(s.publicId && { publicId: s.publicId }),
        })),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Deduct credits
      await updateDoc(doc(db, "profiles", user.uid), {
        credit: increment(-proposalFee),
        updatedAt: serverTimestamp(),
      });

      // Transaction log
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        id: txRef.id,
        userId: user.uid,
        type: "proposal_fee",
        direction: "out",
        amount: proposalFee,
        currency: "LAK",
        previousBalance: freelancerCredit,
        newBalance: freelancerCredit - proposalFee,
        projectId: project.id,
        description: `Proposal submission fee for project "${project.title}"`,
        createdAt: serverTimestamp(),
        status: "completed",
      });

      // Increment project proposals count
      await updateDoc(doc(db, "projects", project.id), {
        proposalsCount: (project.proposalsCount || 0) + 1,
        updatedAt: serverTimestamp(),
      });

      // Create notifications for client and freelancer
      try {
        await createProposalSubmittedNotification(
          project.clientId,
          user.uid,
          project.id,
          project.title,
          proposalId,
          proposalFee
        );
      } catch (notifError) {
        // Log error but don't fail the proposal submission
        console.error("Error creating proposal notification:", notifError);
      }

      toast.success(t("proposePage.submitSuccess") || "Proposal Sent!");

      setTimeout(() => {
        router.push("/proposals");
      }, 1200);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setError(error.message);
      toast.error(t("common.submitFailed") || "Submit failed");
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  // -------------------------------------------------
  // 💬 CREDIT MODAL
  // -------------------------------------------------
  const CreditModal = () => (
    <Dialog
      open={showModal}
      onClose={() => setShowModal(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="rounded-lg p-6 max-w-sm w-full border border-border shadow-lg bg-background">
          <Dialog.Title className="text-lg font-semibold text-text-primary mb-2">
            {canSubmit
              ? t("proposePage.confirmSubmission")
              : t("proposePage.notEnoughCreditsTitle")}
          </Dialog.Title>

          <p className="text-text-secondary mb-4 leading-relaxed">
            {canSubmit ? (
              <>
                {t("proposePage.costToSubmit")}:{" "}
                <span className="font-semibold">{proposalFee}</span>{" "}
                {t("common.credits")}. <br />
                {t("proposePage.confirmToSubmit")}
              </>
            ) : (
              <>
                {t("proposePage.thisProjectRequires")}{" "}
                <span className="font-semibold">{proposalFee}</span>{" "}
                {t("common.credits")}. <br />
                {t("proposePage.notEnoughCreditsMessage")}
              </>
            )}
          </p>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setShowModal(false)}
            >
              {t("common.cancel")}
            </button>

            {canSubmit ? (
              <button
                className="btn btn-primary"
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting
                  ? t("proposePage.submitting")
                  : t("proposePage.submitNow")}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => router.push("/topup")}
              >
                {t("proposePage.topUpCredits")}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );

  // -------------------------------------------------
  // 📄 FORM UI
  // -------------------------------------------------
  return (
    <>
      <CreditModal />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Header */}
        <div className="rounded-xl shadow-sm border border-border bg-background-secondary p-6 flex items-center gap-4">
          <Avatar {...getAvatarProps(profile, user)} size="md" />

          <div>
            <p className="font-semibold text-text-primary">
              {t("proposePage.submittingAs")}:
            </p>
            <p className="text-text-secondary">
              {profile?.fullName || user?.email}
            </p>

            <p className="text-primary text-sm mt-1">
              {t("proposePage.costToSubmit")}:{" "}
              <span className="font-semibold">{proposalFee}</span>{" "}
              {t("common.credits")}
            </p>

            {!canSubmit && (
              <p className="text-error text-sm mt-1">
                {t("proposePage.notEnoughCredits")}
              </p>
            )}
          </div>
        </div>

        {/* Proposal Form */}
        <div className="rounded-xl shadow-sm border border-border bg-background p-6 space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {t("proposePage.proposalDetails")}
          </h2>

          {error && (
            <div className="p-3 bg-error/10 text-error rounded">{error}</div>
          )}

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("proposePage.coverLetterLabel")}
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              required
              placeholder={t("proposePage.coverLetterPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Budget & Hourly Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("proposePage.proposedBudgetLabel")}
              </label>
              <input
                type="number"
                value={proposedBudget}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-secondary"
              />
            </div>

            {project.budgetType === "hourly" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("proposePage.hourlyRateLabel")}
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("proposePage.estimatedDurationLabel")}
            </label>
            <select
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary"
            >
              <option value="">{t("proposePage.selectDuration")}</option>
              <option value="Less than 1 week">
                {t("proposePage.lessThanOneWeek")}
              </option>
              <option value="1-2 weeks">
                {t("proposePage.oneToTwoWeeks")}
              </option>
              <option value="2-4 weeks">
                {t("proposePage.twoToFourWeeks")}
              </option>
              <option value="1-2 months">
                {t("proposePage.oneToTwoMonths")}
              </option>
              <option value="2-3 months">
                {t("proposePage.twoToThreeMonths")}
              </option>
              <option value="More than 3 months">
                {t("proposePage.moreThanThreeMonths")}
              </option>
            </select>
          </div>

          {/* Work Plan */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("proposePage.workPlanLabel")}
            </label>
            <textarea
              value={workPlan}
              onChange={(e) => setWorkPlan(e.target.value)}
              rows={4}
              placeholder={t("proposePage.workPlanPlaceholder")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Work Samples */}
          <WorkSamples
            t={t}
            workSamples={workSamples}
            setWorkSamples={setWorkSamples}
          />

          {/* Milestones */}
          <Milestones
            t={t}
            milestones={milestones}
            setMilestones={setMilestones}
          />

          {/* Summary */}
          <ProposalSummary
            t={t}
            proposedBudget={proposedBudget}
            proposedRate={proposedRate}
            estimatedDuration={estimatedDuration}
            budgetType={project.budgetType}
          />

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary px-8 py-3"
              onClick={() => {
                if (!validateForm()) return; // only open modal if valid
                setShowModal(true);
              }}
            >
              {t("proposePage.submitProposal")}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
