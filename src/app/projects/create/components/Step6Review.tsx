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

  const formattedBudget = formData.budget
    ? formatLAK(Number(formData.budget))
    : t("createProject.noneSpecified");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.reviewSubmit")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.reviewDesc")}
        </p>
      </div>

      {/* 💰 Credit + Budget Overview */}
      <div className="bg-gray-50 p-6 rounded-lg border space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.yourCredits") || "Your Credits"}:
          </span>
          <span className="font-semibold text-green-600">
            {formatLAK(credits || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.requiredCredits") || "Required"}:
          </span>
          <span className="font-semibold text-text-primary">
            {formData.budget
              ? formatLAK(Number(formData.budget))
              : t("createProject.noneSpecified")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-text-primary">
            {t("createProject.remaining") || "Remaining"}:
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

        {credits !== null && credits < Number(formData.budget) && (
          <p className="text-sm text-red-500 mt-2">
            ⚠️ ຄະແນນຂອງທ່ານບໍ່ພໍສໍາລັບງົບປະມານໂປຣເຈັກນີ້.
          </p>
        )}
      </div>

      {/* 🧾 Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border space-y-3 text-sm">
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
