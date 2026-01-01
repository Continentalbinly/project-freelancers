"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import StatusBadge from "@/app/components/ui/StatusBadge";
import type { ProjectStatus } from "@/app/lib/workflow/status";

interface ProjectCardProps {
  project: Project;
  currentUserId: string;
}

export default function ProjectCard({
  project,
  currentUserId,
}: ProjectCardProps) {
  const { t, currentLanguage } = useTranslationContext();
  const isFreelancer = project.acceptedFreelancerId === currentUserId;

  const roleText = isFreelancer
    ? t("myProjects.role.freelancer")
    : t("myProjects.role.client");

  const status = (project.status || "open") as ProjectStatus;

  const router = useRouter();
  
  return (
    <div
      onClick={() => router.push(`/my-projects/${project.id}/progress`)}
      className="group block rounded-xl shadow-sm hover:shadow-xl dark:shadow-gray-900/50 dark:hover:shadow-gray-800/30 border border-border dark:border-gray-700 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/50 overflow-hidden cursor-pointer relative bg-background-secondary dark:bg-gray-800/30 hover:bg-background-tertiary dark:hover:bg-gray-800/50"
    >
      {/* Image Section */}
      <div className="aspect-video w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden relative">
        {project.imageUrl ? (
          <>
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={status} type="project" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 relative">
        <h2 className="text-lg font-bold   dark:text-white line-clamp-2 mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors min-h-[3.5rem]">
          {project.title || t("myProjects.project")}
        </h2>

        {/* Role Badge */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            isFreelancer 
              ? "bg-secondary dark:bg-secondary-light" 
              : "bg-primary dark:bg-primary-light"
          }`}></div>
          <span className="text-text-secondary dark:text-gray-400 font-medium">
            {roleText}
          </span>
        </div>

        {/* Additional Info */}
        {project.budget && (
          <div className="mt-4 pt-4 border-t border-border dark:border-gray-700">
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {t("myProjects.budget")}:{" "}
              <span className="font-semibold   dark:text-white">
                {project.budget.toLocaleString()} {t("common.currncyLAK")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
