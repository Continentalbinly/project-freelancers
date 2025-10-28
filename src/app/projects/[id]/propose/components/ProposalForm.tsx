"use client";

import { useState } from "react";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { doc, setDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/service/firebase";
import WorkSamples from "./WorkSamples";
import Milestones from "./Milestones";
import ProposalSummary from "./ProposalSummary";

export default function ProposalForm({ project, user, profile, t }: any) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState(
    project.budget?.toString() || ""
  );
  const [proposedRate, setProposedRate] = useState(
    project.budgetType === "hourly" ? "15000" : ""
  );
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [workPlan, setWorkPlan] = useState("");
  const [communicationPreferences, setCommunicationPreferences] = useState("");
  const [availability, setAvailability] = useState("");
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

      // upload files
      const uploadedSamples: any[] = [];
      for (const sample of workSamples) {
        if (sample.file) {
          const formData = new FormData();
          formData.append("file", sample.file);
          formData.append("folderType", "proposalsImage");
          formData.append("subfolder", proposalId);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const result = await res.json();
          if (result.success) {
            const { file, ...rest } = sample;
            uploadedSamples.push({ ...rest, url: result.data.url });
          }
        } else uploadedSamples.push(sample);
      }

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
        workSamples: uploadedSamples,
        communicationPreferences,
        availability,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(proposalRef, data);
      await updateDoc(doc(db, "projects", project.id), {
        proposalsCount: (project.proposalsCount || 0) + 1,
        updatedAt: new Date(),
      });

      window.location.href = "/proposals";
    } catch (err: any) {
      console.error("❌ Proposal error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {t("proposePage.proposalDetails")}
        </h2>

        {error && (
          <div className="p-3 bg-error/10 text-error rounded">{error}</div>
        )}

        {/* Cover letter */}
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

        {/* Budget + Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("proposePage.proposedBudgetLabel")}
            </label>
            <input
              type="number"
              value={proposedBudget}
              onChange={(e) => setProposedBudget(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
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

        {/* Work plan */}
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

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("proposePage.communicationPreferencesLabel")}
            </label>
            <input
              value={communicationPreferences}
              onChange={(e) => setCommunicationPreferences(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("proposePage.availabilityLabel")}
            </label>
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
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
