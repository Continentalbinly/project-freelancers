"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { formatLAK } from "@/service/currencyUtils";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  formData: any;
  previewUrl: string;
  t: (key: string) => string;
}

export default function Step6Review({ formData, previewUrl, t }: Props) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

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

  const categoryName =
    typeof formData.category === "object"
      ? formData.category.name_lo || formData.category.name_en
      : formData.category || t("createProject.noneSpecified");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.reviewSubmit")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.reviewDesc")}
        </p>
      </div>

      {/* 💰 Credit Overview */}
      <div className="bg-gray-50 p-6 rounded-lg border border-border shadow-sm space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.yourCredits")}
          </span>
          <span className="font-semibold text-green-600">
            {formatLAK(credits || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.requiredCredits")}
          </span>
          <span className="font-semibold text-text-primary">
            {formData.budget ? formatLAK(Number(formData.budget)) : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.remaining")}
          </span>
          <span
            className={`font-semibold ${
              credits !== null && credits < Number(formData.budget)
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {credits !== null
              ? formatLAK((credits || 0) - Number(formData.budget))
              : t("common.loading")}
          </span>
        </div>
      </div>

      {/* 🧾 Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-border shadow-sm space-y-3 text-sm">
        <p>
          <b>{t("createProject.projectTitle")}:</b> {formData.title}
        </p>
        <p>
          <b>{t("createProject.category")}:</b> {categoryName}
        </p>
        <p>
          <b>{t("createProject.timeline")}:</b> {formData.timeline}
        </p>
        <p>
          <b>{t("createProject.skillsRequired")}:</b>{" "}
          {formData.skillsRequired.join(", ")}
        </p>
        <p>
          <b>{t("createProject.projectVisibility")}:</b> {formData.visibility}
        </p>

        {/* 🔁 Edit Quota */}
        <p>
          <b>{t("createProject.editQuota") || "Edit Quota"}:</b>{" "}
          {formData.editQuota ?? 3}
        </p>

        {/* 🖼️ Sample Images */}
        {formData.sampleImages?.length > 0 && (
          <div className="mt-3">
            <b>{t("createProject.sampleImages") || "Sample Images"}:</b>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {formData.sampleImages.map((url: string) => (
                <img
                  key={url}
                  src={url}
                  alt="sample"
                  className="w-24 h-24 object-cover rounded-md border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="text-center">
          <img
            src={previewUrl}
            alt="Project preview"
            className="w-64 rounded-lg mx-auto"
          />
        </div>
      )}
    </div>
  );
}
