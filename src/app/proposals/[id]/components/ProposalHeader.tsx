"use client";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function ProposalHeader({ router, t }: any) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("proposals.detail.title")}
          </h1>
          <p className="text-text-secondary">
            {t("proposals.detail.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
