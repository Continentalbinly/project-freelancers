"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useProjects } from "./components/useProjects";
import ProjectsFilters from "./components/ProjectsFilters";
import ProjectsGrid from "./components/ProjectsGrid";
import ProjectsSkeleton from "./components/ProjectsSkeleton";

function ProjectsPageContent() {
  const { t } = useTranslationContext();
  const { user, profile, loading: authLoading } = useAuth();
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
  const isClient = profile?.role === "client";

  // Block clients from public projects list; send to manage
  useEffect(() => {
    if (!authLoading && isClient) {
      router.replace("/projects/manage");
    }
  }, [authLoading, isClient, router]);

  // -------------------------------------
  // Sync filters with URL query params
  // -------------------------------------
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    const urlStatus = searchParams.get("status") || "all";

    setFilters((prev) => ({
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
  // Show skeleton during auth loading
  if (authLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="py-4 border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-10 w-full bg-background-secondary dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-7 w-40 bg-background-secondary dark:bg-gray-800 rounded mb-6 animate-pulse" />
            <ProjectsSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (isClient) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="p-6 rounded-xl border border-border shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{t("common.accessRestrictedTitle")}</h2>
          <p className="text-text-secondary text-sm">{t("common.clientRedirectProjects")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
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
              <div className="h-7 w-40 bg-background-secondary dark:bg-gray-800 rounded animate-pulse" />
            ) : (
              <h2 className="text-2xl font-bold text-text-primary">
                {filteredProjects.length} {t("projects.results.title")}
              </h2>
            )}

            {user && isClient && (
              <Link href="/projects/create" className="btn btn-primary">
                {t("projects.postProject")}
              </Link>
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

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsPageContent />
    </Suspense>
  );
}
