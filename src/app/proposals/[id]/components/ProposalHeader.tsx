"use client";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ProposalHeaderProps {
  router: AppRouterInstance;
  t: (key: string) => string;
}

export default function ProposalHeader({ router, t }: ProposalHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-background shadow-sm border border-border hover-surface"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
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
