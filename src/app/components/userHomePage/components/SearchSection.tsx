"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SearchSection() {
  const { t } = useTranslationContext();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {t("userHomePage.search.title")}
            </h2>
            <p className="text-sm text-text-secondary">
              {t("userHomePage.search.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg ${
              showFilters
                ? "bg-primary text-white border-primary"
                : "border-border hover:border-primary"
            }`}
          >
            {t("userHomePage.search.filters")}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("userHomePage.search.placeholder")}
            className="flex-1 border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary"
          />
          <Link
            href={`/projects?search=${query}`}
            className="btn btn-primary px-6 py-3 text-center"
          >
            {t("userHomePage.search.searchButton")}
          </Link>
        </div>

        {showFilters && (
          <p className="text-xs text-text-secondary mt-3 italic">
            {t("userHomePage.search.filtersActive")}
          </p>
        )}
      </div>
    </div>
  );
}
