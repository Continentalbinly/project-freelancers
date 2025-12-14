"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Project } from "@/types/project";

interface RecentProjectsProps {
  projects: Project[];
  isLoading: boolean;
}

export default function RecentProjects({ projects, isLoading }: RecentProjectsProps) {
  const { t } = useTranslationContext();

  return (
    <div className="rounded-lg border border-border bg-background-secondary shadow-sm p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold  ">
          {t("dashboard.recentProjects") || "Recent Projects"}
        </h2>
        <Link
          href="/my-projects"
          className="text-primary font-medium"
        >
          {t("common.viewAll")} 
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/my-projects/${project.id}/progress`}
              className="flex items-center justify-between p-4 border border-border bg-background rounded-lg transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold">
                  {project.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {project.proposalsCount || 0} proposals
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {project.budget?.toLocaleString()} {t("common.currncyLAK")}
                </p>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">
            {t("common.NoProjectsYet") || "No projects yet"}
          </p>
          <Link
            href="/projects/create"
            className="btn bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
          >
            {t("common.postProject") || "Post Your First Project"}
          </Link>
        </div>
      )}
    </div>
  );
}
