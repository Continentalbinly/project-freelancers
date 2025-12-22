"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface ProjectFilters {
  status: string;
  category: string;
  search: string;
}

interface ManageProjectsFiltersProps {
  t: (key: string) => string;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
}

export default function ManageProjectsFilters({ t, filters, setFilters }: ManageProjectsFiltersProps) {
  const router = useRouter();
  const categories = [
    { value: "all", label: t("manageProjects.allCategories") },
    { value: "web-development", label: t("manageProjects.webDevelopment") },
    { value: "content-writing", label: t("manageProjects.contentWriting") },
    { value: "data-analysis", label: t("manageProjects.dataAnalysis") },
    { value: "design", label: t("manageProjects.design") },
    { value: "research", label: t("manageProjects.research") },
    { value: "translation", label: t("manageProjects.translation") },
  ];

  const statusOptions = [
    { value: "all", label: t("manageProjects.allStatus") },
    { value: "open", label: t("manageProjects.open") },
    { value: "in_progress", label: t("manageProjects.inProgress") },
    { value: "completed", label: t("manageProjects.completed") },
    { value: "cancelled", label: t("manageProjects.cancelled") },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">
          {t("manageProjects.title") || "Manage Projects"}
        </h2>
        <button
          onClick={() => router.push("/projects/create")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-primary to-secondary text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          {t("manageProjects.createProject") || "Create Project"}
        </button>
      </div>
      
      <div className="bg-background-secondary rounded-xl shadow-sm border border-border p-6 text-text-primary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2  text-text-primary">
            {t("manageProjects.searchProjects")}
          </label>
          <input
            type="text"
            placeholder={t("manageProjects.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background text-text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2  text-text-primary">
            {t("manageProjects.status")}
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background text-text-primary"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2  text-text-primary">
            {t("manageProjects.category")}
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-background text-text-primary"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>
    </div>
  );
}
