"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function Header({ t, router }: any) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white shadow-sm border border-border hover:shadow-md transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
          {t("proposePage.submitProposal")}
        </h1>
      </div>
      <Link href="/proposals" className="btn btn-outline btn-sm">
        {t("proposePage.viewMyProposals")}
      </Link>
    </div>
  );
}
