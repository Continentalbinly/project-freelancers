"use client";

export default function ManageProjectsFilters({ t, filters, setFilters }: any) {
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
    <div className="bg-background-secondary rounded-xl shadow-sm border border-border p-6 mb-6 text-text-primary">
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
  );
}
