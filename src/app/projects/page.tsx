"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useProjects } from "./components/useProjects";
import ProjectsFilters from "./components/ProjectsFilters";
import ProjectsGrid from "./components/ProjectsGrid";
import ProjectsSkeleton from "./components/ProjectsSkeleton";

export default function ProjectsPage() {
  const { t } = useTranslationContext();
  const { user, profile } = useAuth();
  const {
    filteredProjects,
    loading,
    filters,
    setFilters,
    incrementProjectViews,
  } = useProjects();

  const searchParams = useSearchParams();
  const router = useRouter();

  // -----------------------------
  // 🔐 Determine if user is client
  // -----------------------------
  const roles = profile?.userRoles || [];
  const types = profile?.userType || [];

  const isClient = roles.includes("client") || types.includes("client");

  // -------------------------------------
  // Sync filters with URL query params
  // -------------------------------------
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

  // -------------------------------------
  // Reset Filters
  // -------------------------------------
  const handleReset = () => {
    setFilters({
      search: "",
      category: "all",
      status: "all",
      budgetType: "all",
    });
    router.replace("/projects");
  };

  // -------------------------------------
  // Page UI
  // -------------------------------------
  return (
    <div className="">
      <ProjectsFilters
        filters={filters}
        setFilters={setFilters}
        t={t}
        onReset={handleReset}
      />

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            {loading ? (
              <div className="h-7 w-40 bg-background-tertiary rounded" />
            ) : (
              <h2 className="text-2xl font-bold">
                {filteredProjects.length} {t("projects.results.title")}
              </h2>
            )}

            {user && isClient && (
              <a href="/projects/create" className="btn btn-primary">
                {t("projects.postProject")}
              </a>
            )}
          </div>

          {loading ? (
            <ProjectsSkeleton />
          ) : (
            <ProjectsGrid
              projects={filteredProjects}
              t={t}
              incrementProjectViews={incrementProjectViews}
            />
          )}
        </div>
      </section>
    </div>
  );
}
