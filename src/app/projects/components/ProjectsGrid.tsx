"use client";

import ProjectCard from "./ProjectCard";

export default function ProjectsGrid({
  projects,
  t,
  incrementProjectViews,
}: any) {
  if (!projects.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold   mb-2">
          {t("projects.results.noResults")}
        </h3>
        <p className="text-text-secondary">
          {t("projects.results.noResultsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: any) => (
        <ProjectCard
          key={project.id}
          project={project}
          t={t}
          incrementProjectViews={incrementProjectViews}
        />
      ))}
    </div>
  );
}
