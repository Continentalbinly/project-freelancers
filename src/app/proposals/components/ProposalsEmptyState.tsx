"use client";
import Link from "next/link";

export default function ProposalsEmptyState({ activeTab, t }: any) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-3">
        <svg
          className="w-6 h-6 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2a2 2 0 012-2h.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {activeTab === "submitted"
          ? t("proposals.emptyState.submitted.title")
          : t("proposals.emptyState.received.title")}
      </h3>
      <p className="text-text-secondary mb-4 px-6">
        {activeTab === "submitted"
          ? t("proposals.emptyState.submitted.description")
          : t("proposals.emptyState.received.description")}
      </p>
      {activeTab === "submitted" && (
        <Link href="/projects" className="btn btn-primary text-sm">
          {t("proposals.emptyState.submitted.action")}
        </Link>
      )}
    </div>
  );
}
