"use client";

import type { Project } from "@/types/project";
import { statusColors, getStatusLabel } from "./utils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ProjectHeaderProps {
  project: Project;
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  const { t, currentLanguage } = useTranslationContext() as any;
  const lang = currentLanguage === "lo" ? "lo" : "en"; // safe fallback

  const totalCount = (project.progress || []).length || 1;
  const completedCount = (project.progress || []).filter(
    (s: any) => s.approved
  ).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const statusClass =
    statusColors[project.status as keyof typeof statusColors] ||
    "bg-gray-100 text-gray-700";

  return (
    <div className="mb-6">
      {/* 🔹 Title & Description */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">{project.title}</h1>
      <p className="text-gray-600 mb-4">{project.description}</p>

      {/* 🔹 Status & Task Count */}
      <div className="flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
        >
          {getStatusLabel(project.status as any, lang)}
        </span>
        <p className="text-sm text-gray-500">
          {completedCount} / {totalCount}{" "}
          {lang === "lo" ? "ວຽກທີ່ອະນຸມັດແລ້ວ" : "tasks approved"}
        </p>
      </div>

      {/* 🔹 Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
        <div
          className="h-2 bg-primary rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
