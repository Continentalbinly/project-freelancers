"use client";

import { useRouter } from "next/navigation";
import { Briefcase, Layers, FolderKanban } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface QuickActionsProps {
  variant: "client" | "freelancer";
}

export default function QuickActions({ variant }: QuickActionsProps) {
  const { t } = useTranslationContext();
  const router = useRouter();

  if (variant === "client") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Manage Projects */}
        <button
          onClick={() => router.push("/projects/manage")}
          className="bg-linear-to-br from-primary to-primary-hover hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group text-left w-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.manageProjects") || "Manage Projects"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.manageProjectsDesc") || "View, edit, and track your projects"}
              </p>
            </div>
            <FolderKanban className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        {/* My Projects */}
        <button
          onClick={() => router.push("/my-projects")}
          className="bg-linear-to-br from-emerald-600 to-emerald-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group text-left w-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {t("clientDashboard.myProjects") || "My Projects"}
              </h3>
              <p className="text-white/80">
                {t("clientDashboard.myProjectsDesc") ||
                  "Track your posted projects and progress"}
              </p>
            </div>
            <Briefcase className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>
    );
  }

  // Freelancer variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {/* My Projects (Project-based work) */}
      <button
        onClick={() => router.push("/my-projects")}
        className="bg-linear-to-br from-emerald-600 to-emerald-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group text-left w-full"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.myProjects") || "My Projects"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.myProjectsDesc") ||
                "Track accepted projects and deliverables"}
            </p>
          </div>
          <FolderKanban className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </button>

      {/* My Services (Catalog) */}
      <button
        onClick={() => router.push("/catalog/manage")}
        className="bg-linear-to-br from-blue-600 to-blue-700 hover:shadow-lg transition-all rounded-lg p-8 text-white cursor-pointer group text-left w-full"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("freelancerDashboard.myServices") || "My Services"}
            </h3>
            <p className="text-white/80">
              {t("freelancerDashboard.myServicesDesc") || "Manage your gigs and packages"}
            </p>
          </div>
          <Layers className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </button>
    </div>
  );
}
