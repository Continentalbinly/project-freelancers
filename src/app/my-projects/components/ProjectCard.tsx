"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { statusColors, getStatusLabel } from "../utils/statusUtils"; // ✅ import

interface ProjectCardProps {
  project: Project;
  currentUserId: string;
}

export default function ProjectCard({
  project,
  currentUserId,
}: ProjectCardProps) {
  const { currentLanguage } = useTranslationContext();
  const isFreelancer = project.acceptedFreelancerId === currentUserId;

  const roleText =
    currentLanguage === "lo"
      ? isFreelancer
        ? "ທ່ານແມ່ນຟຣີແລນເຊີ"
        : "ທ່ານແມ່ນຜູ້ວ່າຈ້າງ"
      : isFreelancer
      ? "You are the freelancer"
      : "You are the client";

  const status = project.status || "unknown";
  const statusLabel = getStatusLabel(status, currentLanguage as "en" | "lo");

  const router = useRouter();
  
  return (
    <div
      onClick={() => router.push(`/my-projects/${project.id}/progress`)}
      className="group block rounded-xl shadow-sm hover:shadow-xl dark:shadow-gray-900/50 border border-border dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 dark:hover:border-primary/50 overflow-hidden cursor-pointer"
    >
      {/* Image Section */}
      <div className="aspect-video w-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden relative">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm border shadow-sm ${
              statusColors[status] || "border-gray-200 dark:border-gray-700"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h2 className="text-lg font-bold   dark:text-white line-clamp-2 mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors min-h-[3.5rem]">
          {project.title ||
            (currentLanguage === "lo" ? "ໂຄງການບໍ່ມີຊື່" : "Untitled Project")}
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
              {currentLanguage === "lo" ? "ງົບປະມານ" : "Budget"}:{" "}
              <span className="font-semibold   dark:text-white">
                {project.budget.toLocaleString()} {currentLanguage === "lo" ? "ກີບ" : "LAK"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
