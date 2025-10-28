"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
  t: (key: string) => string;
  onReset?: () => void; // ✅ optional callback from parent
}

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

export default function ProjectsFilters({
  filters,
  setFilters,
  t,
  onReset,
}: Props) {
  const { currentLanguage } = useTranslationContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const update = (key: string, value: string) =>
    setFilters({ ...filters, [key]: value });

  // Local reset (for fallback)
  const reset = () =>
    setFilters({
      search: "",
      category: "all",
      status: "all",
    });

  // 🔹 Fetch categories from Firestore
  useEffect(() => {
    async function fetchCategories() {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Category, "id">),
        }));
        setCategories(list);
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-border py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
          {/* 🔍 Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("projects.search.placeholder")}
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm placeholder-gray-400 shadow-sm transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z"
              />
            </svg>
          </div>

          {/* 🏷️ Category */}
          <div className="w-full lg:w-48">
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm transition-all"
            >
              <option value="all">{t("projects.filters.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {currentLanguage === "lo"
                    ? cat.name_lo || cat.name_en
                    : cat.name_en || cat.name_lo}
                </option>
              ))}
            </select>
          </div>

          {/* 📊 Status */}
          <div className="w-full lg:w-48">
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm transition-all"
            >
              <option value="all">{t("projects.filters.allStatus")}</option>
              <option value="open">{t("projects.statuses.open")}</option>
              <option value="in_progress">
                {t("projects.statuses.inProgress")}
              </option>
              <option value="completed">
                {t("projects.statuses.completed")}
              </option>
            </select>
          </div>

          {/* ❌ Clear Filters */}
          <button
            onClick={onReset || reset} // ✅ Use parent callback if provided
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 hover:border-primary hover:text-primary bg-white transition-all shadow-sm"
          >
            {t("projects.search.clearFilters")}
          </button>
        </div>
      </div>
    </section>
  );
}
