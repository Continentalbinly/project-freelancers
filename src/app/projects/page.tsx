"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useProjects } from "./components/useProjects";
import ProjectsFilters from "./components/ProjectsFilters";
import ProjectsGrid from "./components/ProjectsGrid";

export default function ProjectsPage() {
  const { t } = useTranslationContext();
  const { user } = useAuth();
  const {
    filteredProjects,
    loading,
    filters,
    setFilters,
    incrementProjectViews,
  } = useProjects();

  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Watch URL changes — reactively sync filters
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    const urlStatus = searchParams.get("status") || "all";

    setFilters((prev: any) => ({
      ...prev,
      search: urlSearch,
      category: urlCategory,
      status: urlStatus,
    }));
  }, [searchParams, setFilters]);

  // 🔄 Reset filters and clear query params
  const handleReset = () => {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      budgetType: "all",
    });
    router.replace("/projects");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("projects.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <ProjectsFilters
        filters={filters}
        setFilters={setFilters}
        t={t}
        onReset={handleReset}
      />

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              {filteredProjects.length} {t("projects.results.title")}
            </h2>
            {user && (
              <a href="/projects/create" className="btn btn-primary">
                {t("projects.postProject")}
              </a>
            )}
          </div>

          <ProjectsGrid
            projects={filteredProjects}
            t={t}
            incrementProjectViews={incrementProjectViews}
          />
        </div>
      </section>
    </div>
  );
}
