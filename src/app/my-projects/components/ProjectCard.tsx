"use client";

import Link from "next/link";
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

  return (
    <Link
      href={`/my-projects/${project.id}/progress`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl overflow-hidden relative">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            {currentLanguage === "lo" ? "ບໍ່ມີຮູບ" : "No image"}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">
          {project.title ||
            (currentLanguage === "lo" ? "ໂຄງການບໍ່ມີຊື່" : "Untitled Project")}
        </h2>

        <span
          className={`inline-flex items-center w-fit px-3 py-1 text-xs font-medium rounded-full border ${
            statusColors[status] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {statusLabel}
        </span>

        <p className="text-sm text-gray-500">{roleText}</p>
      </div>
    </Link>
  );
}
