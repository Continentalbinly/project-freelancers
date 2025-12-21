"use client";

import ProjectCard from "./ProjectCard";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ManageProjectsList({
  projects,
  filters,
  t,
  onProjectDeleted,
}: any) {
  const router = useRouter();
  const filtered = projects.filter((p: any) => {
    const matchStatus = filters.status === "all" || p.status === filters.status;
    const matchCat =
      filters.category === "all" || p.category === filters.category;
    const matchSearch =
      p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    return (
      <div className="bg-background rounded-xl shadow-sm border border-border text-center py-12">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t("manageProjects.noProjectsFound")}
        </h3>
        <p className="text-text-secondary mb-6">
          {projects.length === 0
            ? t("manageProjects.noProjectsYet")
            : t("manageProjects.noProjectsMatch")}
        </p>

        {projects.length === 0 && (
          <button onClick={() => router.push("/projects/create")} className="btn btn-primary cursor-pointer">
            <PlusIcon className="w-5 h-5 mr-2" />
            {t("manageProjects.postFirstProject")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filtered.map((project: any) => (
        <ProjectCard
          key={project.id}
          project={project}
          t={t}
          onProjectDeleted={onProjectDeleted}
        />
      ))}
    </div>
  );
}
