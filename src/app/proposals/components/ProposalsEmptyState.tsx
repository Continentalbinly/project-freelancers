"use client";
import Link from "next/link";

export default function ProposalsEmptyState({ activeTab, t }: any) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2a2 2 0 012-2h.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {activeTab === "submitted"
          ? t("proposals.emptyState.submitted.title")
          : t("proposals.emptyState.received.title")}
      </h3>
      <p className="text-text-secondary mb-6 px-6 max-w-md mx-auto">
        {activeTab === "submitted"
          ? t("proposals.emptyState.submitted.description")
          : t("proposals.emptyState.received.description")}
      </p>
      {activeTab === "submitted" && (
        <Link href="/projects" className="btn btn-primary">
          {t("proposals.emptyState.submitted.action")}
        </Link>
      )}
    </div>
  );
}
