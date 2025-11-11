"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";

import ProjectStepper from "./components/ProjectStepper";
import StepOpen from "./components/StepOpen";
import StepInProgress from "./components/StepInProgress";
import StepInReview from "./components/StepInReview";
import StepCompleted from "./components/StepCompleted";
import { getRole, ProjectStatus, UserRole } from "./components/utils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function ProjectProgressPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslationContext();

  useEffect(() => {
    const loadProject = async () => {
      const ref = doc(db, "projects", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) setProject({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    loadProject();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary text-sm sm:text-base">
          {t("common.loading")}
        </p>
      </div>
    );
  if (!project)
    return <p className="text-center text-gray-500">Project not found.</p>;

  const role = getRole(project, user?.uid) as UserRole;
  const status = (project.status || "open") as ProjectStatus;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <ProjectStepper current={status} />

      {status === "open" && <StepOpen project={project} role={role} />}
      {status === "in_progress" && (
        <StepInProgress project={project} role={role} />
      )}
      {status === "in_review" && <StepInReview project={project} role={role} />}
      {status === "completed" && <StepCompleted project={project} />}
    </div>
  );
}
