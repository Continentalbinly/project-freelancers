"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { statusSteps, ProjectStatus, getStatusLabel } from "./utils";
import Stepper from "@/app/(freelancer)/catalog/components/Stepper";

interface ProjectProgressTimelineProps {
  status: ProjectStatus;
}

export default function ProjectProgressTimeline({ status }: ProjectProgressTimelineProps) {
  const { t, currentLanguage } = useTranslationContext();
  const lang = currentLanguage === "lo" ? "lo" : "en";

  const currentIndex = statusSteps.indexOf(status);
  const lastIndex = statusSteps.length - 1;
  
  // When project is completed, show all steps as completed
  const displayIndex = status === "completed" ? lastIndex : currentIndex >= 0 ? currentIndex : 0;

  // Get step labels using the existing getStatusLabel function
  const stepLabels = statusSteps.map((step) => getStatusLabel(step, lang));

  return (
    <div className="mb-8 bg-background-secondary rounded-xl p-6 border border-border">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        {t("myProjects.projectProgress") || "Project Progress"}
      </h3>
      <Stepper steps={stepLabels} current={displayIndex} progressPosition="center" />
    </div>
  );
}

