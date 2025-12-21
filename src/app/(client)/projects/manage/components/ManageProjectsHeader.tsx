"use client";

import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function ManageProjectsHeader({ t, router }: any) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-background shadow-sm border border-border hover-surface"
        >
          <ChevronLeftIcon className="w-5 h-5  " />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("manageProjects.manageProjects")}
          </h1>
          <p className="text-text-secondary">
            {t("manageProjects.manageProjectsDesc")}
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push("/projects/create")}
        className="btn btn-primary inline-flex items-center shadow-sm cursor-pointer"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        {t("manageProjects.postNewProject")}
      </button>
    </div>
  );
}
