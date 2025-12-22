"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Project } from "@/types/project";

interface ProjectActionsProps {
  project: Project;
  t: (key: string) => string;
}

export default function ProjectActions({ project, t }: ProjectActionsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const isOwner = user?.uid === project.clientId;

  const isFreelancer = profile?.role === "freelancer";

  return (
    <div className="rounded-lg shadow-sm border border-border dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold   mb-4">
        {t("projectDetail.actions")}
      </h3>

      <div className="space-y-3">
        {/* ✅ Submit Proposal (freelancer only + not owner + open) */}
        {user && project.status === "open" && !isOwner && isFreelancer && (
          <button
            onClick={() => router.push(`/projects/${project.id}/propose`)}
            className="btn btn-primary w-full cursor-pointer"
          >
            {t("projectDetail.submitProposal")}
          </button>
        )}

        {/* 🚫 Cannot propose own project */}
        {user && project.status === "open" && isOwner && (
          <div className="p-3 bg-background-secondary rounded-lg border border-border dark:border-gray-700">
            <p className="text-sm text-text-secondary text-center">
              {t("projectDetail.ownProjectMessage")}
            </p>
          </div>
        )}

        {/* 🚫 Not a freelancer */}
        {user && project.status === "open" && !isOwner && !isFreelancer && (
          <div className="p-3 bg-background-secondary rounded-lg border border-border dark:border-gray-700">
            <p className="text-sm text-text-secondary text-center">
              {t("projectDetail.onlyFreelancerMessage")}
            </p>
          </div>
        )}

        {/* ✏️ Edit Project — only if owner AND project is open */}
        {user && isOwner && project.status === "open" && (
          <button
            onClick={() => router.push(`/projects/${project.id}/edit`)}
            className="btn btn-outline w-full cursor-pointer"
          >
            {t("projectDetail.editProject")}
          </button>
        )}

        {/* 🔙 Back to home */}
        <button onClick={() => router.push("/")} className="btn btn-outline w-full cursor-pointer">
          {t("common.back2home")}
        </button>
      </div>
    </div>
  );
}
