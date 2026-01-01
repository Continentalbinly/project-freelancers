"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";

import ProjectProgressTimeline from "./components/ProjectProgressTimeline";
import StepOpen from "./components/StepOpen";
import StepInProgress from "./components/StepInProgress";
import StepInReview from "./components/StepInReview";
import StepCompleted from "./components/StepCompleted/StepCompleted";
import StepPayout from "./components/StepPayout";

import { getRole, ProjectStatus, UserRole } from "./components/utils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import WorkroomLayout from "@/app/components/workroom/WorkroomLayout";
import Skeleton from "@/app/components/ui/Skeleton";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import StatusBadge from "@/app/components/ui/StatusBadge";
import type { Project } from "@/types/project";

export default function ProjectProgressPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslationContext();

  useEffect(() => {
    const load = async () => {
      const ref = doc(requireDb(), "projects", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() } as Project);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading)
    return (
      <WorkroomLayout
        title={t("common.loading") || "Loading..."}
        sidebarContent={
          <div className="space-y-4">
            <Skeleton height={100} />
            <Skeleton height={200} />
          </div>
        }
      >
        <div className="space-y-4">
          <Skeleton height={300} />
          <Skeleton height={200} />
        </div>
      </WorkroomLayout>
    );

  if (!project)
    return (
      <WorkroomLayout
        title={t("myProjects.notFound") || "Project not found"}
        sidebarContent={null}
      >
        <p className="text-center text-text-secondary py-8">
          {t("myProjects.notFoundDesc") || "The project you're looking for doesn't exist."}
        </p>
      </WorkroomLayout>
    );

  const role = getRole(project, user?.uid) as UserRole;
  const status = (project.status || "open") as ProjectStatus;

  const breadcrumbs = [
    { label: t("myProjects.title") || "My Projects", href: "/my-projects" },
    { label: project.title || t("myProjects.project") || "Project" },
  ];

  return (
    <WorkroomLayout
      title={project.title || t("myProjects.project") || "Project"}
      subtitle={
        role === "client"
          ? t("myProjects.role.client") || "You are the client"
          : role === "freelancer"
          ? t("myProjects.role.freelancer") || "You are the freelancer"
          : undefined
      }
      breadcrumbs={breadcrumbs}
      sidebarContent={
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              {t("myProjects.status") || "Status"}
            </h3>
            <StatusBadge status={status} type="project" />
          </div>
          {project.budget && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                {t("myProjects.budget") || "Budget"}
              </h3>
              <p className="text-2xl font-bold text-text-primary">
                ₭{project.budget.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-8">
        <ProjectProgressTimeline status={status} />

        <div className="mt-8">
          {status === "open" && <StepOpen project={project} role={role} />}
          {status === "in_progress" && (
            <StepInProgress project={project} role={role} />
          )}
          {status === "in_review" && (
            <StepInReview project={project} role={role} />
          )}
          {status === "payout_project" && (
            <StepPayout project={project} role={role} />
          )}
          {status === "completed" && <StepCompleted project={project} />}
        </div>
      </div>
    </WorkroomLayout>
  );
}
