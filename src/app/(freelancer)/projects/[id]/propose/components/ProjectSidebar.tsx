"use client";

import Avatar from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  project: Project;
  t: (key: string) => string;
}

export default function ProjectSidebar({ project, t }: ProjectSidebarProps) {
  const { currentLanguage } = useTranslationContext();

  const categoryName =
    typeof project.category === "object"
      ? currentLanguage === "lo"
        ? project.category?.name_lo ||
          project.category?.name_en ||
          "Uncategorized"
        : project.category?.name_en ||
          project.category?.name_lo ||
          "Uncategorized"
      : project.category || "Uncategorized";

  return (
    <aside
      className="
        rounded-xl
        shadow-sm
        border border-border
        bg-background-secondary
        p-6
        lg:sticky
        lg:top-[100px]
        self-start
      "
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        {t("proposePage.projectDetails")}
      </h2>

      <div className="space-y-4">
        {/* Title + Description */}
        <div>
          <h3 className="font-medium text-text-primary mb-1">
            {project.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-3">
          <Avatar
            src={project.client?.avatarUrl || undefined}
            name={project.client?.fullName}
            size="md"
          />
          <div>
            <p className="font-medium text-text-primary">
              {project.client?.fullName}
            </p>
            <p className="text-xs text-text-secondary">
              {project.client?.rating
                ? `${t("proposePage.rating")}${project.client.rating}/5`
                : t("proposePage.newClient")}
            </p>
          </div>
        </div>

        {/* Project Meta */}
        <div className="text-sm text-text-secondary space-y-1">
          <div className="flex justify-between">
            <span>{t("proposePage.budget")}:</span>
            <span className="font-medium  ">
              {formatEarnings(project.budget)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>{t("proposePage.type")}:</span>
            <span className="font-medium capitalize">{project.budgetType}</span>
          </div>

          <div className="flex justify-between">
            <span>{t("proposePage.category")}:</span>
            <span className="font-medium truncate">{categoryName}</span>
          </div>
        </div>

        {/* Skills */}
        {project.skillsRequired && project.skillsRequired.length > 0 && (
          <div>
            <h4 className="font-medium text-text-primary mb-1">
              {t("proposePage.requiredSkills")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.skillsRequired.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 Proposal Fee Requirement */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="font-medium text-text-primary mb-1">
            {t("proposePage.applicationFee")}
          </h4>

          <p className="text-sm text-text-secondary">
            {t("proposePage.thisProjectRequires")}{" "}
            <span className="font-semibold text-primary">
              {project.postingFee}
            </span>{" "}
            {t("proposePage.creditsToApply")}
          </p>
        </div>
      </div>
    </aside>
  );
}
