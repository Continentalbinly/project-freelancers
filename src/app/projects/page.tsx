"use client";

import { useEffect, useRef } from "react";
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
    projects,
    filteredProjects,
    loading,
    filters,
    setFilters,
    incrementProjectViews,
  } = useProjects();

  const searchParams = useSearchParams();
  const router = useRouter();

  // 🧠 Prevent reapplying URL filters multiple times
  const initialized = useRef(false);

  useEffect(() => {
    if (loading || initialized.current) return;

    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    const urlStatus = searchParams.get("status") || "all";

    // ✅ apply only on first mount
    setFilters({
      search: urlSearch,
      category: urlCategory,
      status: urlStatus,
      budgetType: "all",
    });

    initialized.current = true;
  }, [loading, searchParams, setFilters]);

  // ✅ Clear query params when resetting filters
  const handleReset = () => {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      budgetType: "all",
    });
    router.replace("/projects"); // clear ?query=... in URL
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
    <div className="bg-background min-h-screen">
      {/* 🌟 Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-10 text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          {t("projects.hero.title")}
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto">
          {t("projects.hero.subtitle")}
        </p>
      </section>

      {/* 🔍 Filters */}
      <ProjectsFilters
        filters={filters}
        setFilters={setFilters}
        t={t}
        onReset={handleReset} // 👈 pass custom reset
      />

      {/* 📋 Projects Grid */}
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
