"use client";

import { timeAgo } from "@/service/timeUtils";
import { formatEarnings } from "@/service/currencyUtils";
import ProjectImage, {
  getProjectImageProps,
} from "@/app/utils/projectImageHandler";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface PortfolioTabProps {
  t: (key: string) => string;
  userProjects: any[];
  loadingData: boolean;
}

export default function PortfolioTab({
  t,
  userProjects,
  loadingData,
}: PortfolioTabProps) {
  const { currentLanguage } = useTranslationContext();
  const completed = userProjects.filter((p: any) => p.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold  ">
          {t("profile.portfolioSection.title")}
        </h3>
      </div>

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary rounded-lg p-4 animate-pulse border border-border dark:border-gray-700"
            >
              <div className="h-4 rounded mb-2"></div>
              <div className="h-3 rounded mb-2"></div>
            </div>
          ))}
        </div>
      ) : completed.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border dark:border-gray-700">
            <svg
              className="w-8 h-8 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold   mb-2">
            {t("profile.portfolioSection.noProjects")}
          </h3>
          <p className="text-text-secondary">
            {t("profile.portfolioSection.noProjectsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completed.map((project: any) => (
            <div
              key={project.id}
              className="border border-border dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <ProjectImage
                  {...getProjectImageProps(project)}
                  size="full"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full backdrop-blur-sm">
                    {t("profile.portfolioSection.completed")}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold   mb-2 line-clamp-2">
                    {project.title}
                  </h4>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {project.skillsRequired?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {project.skillsRequired.slice(0, 2).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skillsRequired.length > 2 && (
                      <span className="px-2 py-1 bg-background-secondary text-text-secondary dark:text-text-secondary text-xs rounded-full border border-border dark:border-gray-700">
                        +{project.skillsRequired.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{formatEarnings(project.budget)}</span>
                  <span>{timeAgo(project.createdAt, currentLanguage)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
