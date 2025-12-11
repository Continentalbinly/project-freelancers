"use client";

import { timeAgo } from "@/service/timeUtils";
import { formatLAK } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ProjectSidebarProps {
  project: any;
  t: (key: string) => string;
}

export default function ProjectSidebar({ project, t }: ProjectSidebarProps) {
  const { currentLanguage } = useTranslationContext();

  const formatBudget = (budget: number, type: string) => {
    return type === "hourly"
      ? `${formatLAK(budget, { compact: true })}/hr`
      : formatLAK(budget, { compact: true });
  };

  // ✅ Get category name dynamically from Firestore object
  const getLocalizedCategoryName = (category: any) => {
    if (!category) return t("projectDetail.noCategory");
    if (typeof category === "string") return category; // fallback for old projects
    return currentLanguage === "lo"
      ? category.name_lo || category.name_en
      : category.name_en || category.name_lo;
  };

  return (
    <div className="rounded-lg shadow-sm border border-border dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold   mb-4">
        {t("projectDetail.projectDetails")}
      </h3>

      <div className="space-y-4">
        {/* 💰 Budget */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">
            {t("projectDetail.budget")}:
          </span>
          <span className="font-semibold  ">
            {formatBudget(project.budget, project.budgetType)}
          </span>
        </div>

        {/* 🏷️ Category */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">
            {t("projectDetail.category")}:
          </span>
          <span className="font-semibold  ">
            {getLocalizedCategoryName(project.category)}
          </span>
        </div>

        {/* 🕓 Timeline */}
        {project.timeline && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {t("projectDetail.timeline")}:
            </span>
            <span className="font-semibold  ">
              {project.timeline}
            </span>
          </div>
        )}

        {/* 🗓️ Posted */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">
            {t("projectDetail.posted")}:
          </span>
          <span className="font-semibold  ">
            {timeAgo(project.createdAt, currentLanguage)}
          </span>
        </div>

        {/* 🔁 Updated */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">
            {t("projectDetail.lastUpdated")}:
          </span>
          <span className="font-semibold  ">
            {timeAgo(project.updatedAt, currentLanguage)}
          </span>
        </div>
      </div>
    </div>
  );
}
