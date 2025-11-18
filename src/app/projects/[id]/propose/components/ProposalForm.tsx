"use client";

import { useState } from "react";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { doc, setDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/service/firebase";
import WorkSamples from "./WorkSamples";
import Milestones from "./Milestones";
import ProposalSummary from "./ProposalSummary";
import { toast } from "react-toastify";

export default function ProposalForm({ project, user, profile, t }: any) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget] = useState(project.budget?.toString() || "");
  const [proposedRate, setProposedRate] = useState(
    project.budgetType === "hourly" ? "15000" : ""
  );
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [workPlan, setWorkPlan] = useState("");
  const [workSamples, setWorkSamples] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📨 Submit proposal
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      const proposalRef = doc(collection(db, "proposals"));
      const proposalId = proposalRef.id;

      const data = {
        id: proposalId,
        projectId: project.id,
        freelancerId: user.uid,
        coverLetter,
        proposedBudget: Number(proposedBudget),
        proposedRate: Number(proposedRate),
        estimatedDuration,
        workPlan,
        milestones,
        workSamples: workSamples.map((s) => ({
          title: s.title,
          url: s.url,
          type: s.type,
          publicId: s.publicId || null,
        })),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(proposalRef, data);

      await updateDoc(doc(db, "projects", project.id), {
        proposalsCount: (project.proposalsCount || 0) + 1,
        updatedAt: new Date(),
      });

      toast.success(t("common.submitSuccess") || "Submit Success", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setTimeout(() => {
        window.location.href = "/proposals";
      }, 1800);
    } catch (err: any) {
      setError(err.message);
      toast.error(
        t("common.submitFailed") || "Submit Failed, Please try again",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex items-center gap-4 mb-4">
        <Avatar {...getAvatarProps(profile, user)} size="md" />
        <div>
          <p className="font-semibold text-text-primary">
            {t("proposePage.submittingAs")}:
          </p>
          <p className="text-text-secondary">
            {profile?.fullName || user?.email}
          </p>
        </div>
      </div>

      {/* Proposal Form */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {t("proposePage.proposalDetails")}
        </h2>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded">{error}</div>
        )}

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t("proposePage.coverLetterLabel")}
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            required
            placeholder={t("proposePage.coverLetterPlaceholder")}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Budget + Hourly Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("proposePage.proposedBudgetLabel")}
            </label>
            <input
              type="number"
              value={proposedBudget}
              readOnly
              className="w-full px-3 py-2 border border-border rounded-lg bg-gray-50 text-text-secondary cursor-not-allowed"
            />
          </div>

          {project.budgetType === "hourly" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("proposePage.hourlyRateLabel")}
              </label>
              <input
                type="number"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t("proposePage.estimatedDurationLabel")}
          </label>
          <select
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("proposePage.selectDuration")}</option>
            <option value="Less than 1 week">
              {t("proposePage.lessThanOneWeek")}
            </option>
            <option value="1-2 weeks">{t("proposePage.oneToTwoWeeks")}</option>
            <option value="2-4 weeks">{t("proposePage.twoToFourWeeks")}</option>
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
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t("proposePage.workPlanLabel")}
          </label>
          <textarea
            value={workPlan}
            onChange={(e) => setWorkPlan(e.target.value)}
            rows={4}
            placeholder={t("proposePage.workPlanPlaceholder")}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
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

        {/* Summary + Submit */}
        <ProposalSummary
          t={t}
          proposedBudget={proposedBudget}
          proposedRate={proposedRate}
          estimatedDuration={estimatedDuration}
          budgetType={project.budgetType}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary px-8 py-3 disabled:opacity-50"
          >
            {submitting
              ? t("proposePage.submitting")
              : t("proposePage.submitProposal")}
          </button>
        </div>
      </div>
    </form>
  );
}
