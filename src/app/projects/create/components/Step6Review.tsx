"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { formatLAK } from "@/service/currencyUtils";

interface Props {
  formData: any;
  previewUrl: string;
  t: (key: string) => string;
}

export default function Step6Review({ formData, previewUrl, t }: Props) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  // Load user credits
  useEffect(() => {
    async function fetchCredits() {
      if (!user) return;
      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);
        setCredits(snap.exists() ? snap.data().credit ?? 0 : 0);
      } catch {
        setCredits(0);
      }
    }
    fetchCredits();
  }, [user]);

  const category = formData.category;
  const categoryLabel =
    category?.name_lo || category?.name_en || t("createProject.noneSpecified");

  const postingFee = formData.postingFee || 0;

  // NEW 2.0 — project budget must exist
  const projectBudget = Number(formData.budget || 0);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.reviewSubmit")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.reviewDesc")}
        </p>
      </div>

      {/* CREDIT OVERVIEW */}
      <div className="bg-gray-50 p-6 rounded-lg border border-border shadow-sm space-y-4 text-sm">
        {/* Your Credits */}
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.yourCredits")}
          </span>
          <span className="font-semibold text-green-600">{credits ?? 0}</span>
        </div>

        {/* Posting Fee */}
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.postingFee")}
          </span>
          <span className="font-semibold text-text-primary">{postingFee}</span>
        </div>

        {/* Remaining after posting fee */}
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.remaining")}
          </span>
          <span
            className={`font-semibold ${
              credits !== null && credits < postingFee
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {credits !== null
              ? (credits || 0) - postingFee
              : t("common.loading")}
          </span>
        </div>
      </div>

      {/* PROJECT BUDGET CARD (NEW!) */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm text-sm space-y-2">
        <p className="font-medium text-text-primary">
          {t("createProject.projectBudget")}
        </p>
        <p className="text-lg font-semibold text-blue-600">
          {formatLAK(projectBudget)}
        </p>
        <p className="text-xs text-blue-700">
          {t("createProject.projectBudgetNote") ||
            "This amount will be placed into escrow only when you hire a freelancer."}
        </p>
      </div>

      {/* PROJECT SUMMARY */}
      <div className="bg-gray-50 p-6 rounded-lg border border-border shadow-sm text-sm space-y-3">
        <p>
          <b>{t("createProject.projectTitle")}:</b> {formData.title}
        </p>
        <p>
          <b>{t("createProject.category")}:</b> {categoryLabel}
        </p>
        <p>
          <b>{t("createProject.timeline")}:</b> {formData.timeline || "-"}
        </p>
        <p>
          <b>{t("createProject.skillsRequired")}:</b>{" "}
          {formData.skillsRequired.length > 0
            ? formData.skillsRequired.join(", ")
            : t("createProject.noneSpecified")}
        </p>
        <p>
          <b>{t("createProject.projectVisibility")}:</b> {formData.visibility}
        </p>

        <p>
          <b>{t("createProject.editQuota")}:</b> {formData.editQuota ?? 3}
        </p>

        {/* Sample images */}
        {formData.sampleImages?.length > 0 && (
          <div className="mt-3">
            <b>{t("createProject.sampleImages")}:</b>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {formData.sampleImages.map((url: string) => (
                <img
                  key={url}
                  src={url}
                  className="w-24 h-24 rounded-md border border-border object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BANNER PREVIEW */}
      {previewUrl && (
        <div className="text-center">
          <img
            src={previewUrl}
            alt="Banner preview"
            className="w-72 rounded-lg mx-auto shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
