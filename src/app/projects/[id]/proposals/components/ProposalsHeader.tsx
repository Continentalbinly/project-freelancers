"use client";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function ProposalsHeader({ project, router }: any) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={() => router.back()}
        className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
      >
        <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Project Proposals
        </h1>
        <p className="text-text-secondary">
          {project
            ? `Review proposals for "${project.title}"`
            : "Loading project..."}
        </p>
      </div>
    </div>
  );
}
