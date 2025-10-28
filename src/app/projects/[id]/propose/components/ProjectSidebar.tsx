"use client";

import Avatar from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function ProjectSidebar({ project, t }: any) {
  const { currentLanguage } = useTranslationContext();

  // ✅ Handle both string & object categories safely
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
        bg-white
        rounded-xl
        shadow-sm
        border border-border
        p-6
        lg:sticky
        lg:top-[100px]     /* 👈 about under navbar (adjust to your header height) */
        self-start         /* prevents full height stretch in grid layout */
        transition-all
        duration-300
      "
    >
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        {t("proposePage.projectDetails")}
      </h2>

      {/* Project Info */}
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
            src={project.client?.avatarUrl}
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
            <span className="font-medium text-text-primary">
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
        {project.skills?.length > 0 && (
          <div>
            <h4 className="font-medium text-text-primary mb-1">
              {t("proposePage.requiredSkills")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
