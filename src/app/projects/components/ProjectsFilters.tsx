"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  filters: any;
  setFilters: (f: any) => void;
  t: (key: string) => string;
  onReset?: () => void;
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key: string, value: string) =>
    setFilters({ ...filters, [key]: value });

  const reset = () =>
    setFilters({
      search: "",
      category: "all",
      status: "all",
    });

  // 🔹 Fetch categories
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
    <section
      className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-border 
                 shadow-sm transition-all duration-300 ease-in-out"
    >
      {/* ✅ Balanced vertical padding for perfect centering */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 md:py-3.5 flex flex-col justify-center">
        {/* 💡 Mobile: simple search + filter button */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("projects.search.placeholder")}
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 absolute left-2.5 top-2.5 text-gray-400"
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
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:border-primary hover:text-primary transition-all"
          >
            {mobileOpen ? t("common.hideFilters") : t("common.filters")}
          </button>
        </div>

        {/* 🧩 Desktop Filters */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3 mt-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <input
              type="text"
              placeholder={t("projects.search.placeholder")}
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm transition-all"
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

          {/* Filters group (center-aligned vertically) */}
          <div className="flex items-center gap-3">
            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              disabled={loading}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm"
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

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary text-sm shadow-sm"
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

            {/* Reset */}
            <button
              onClick={onReset || reset}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              {t("projects.search.clearFilters")}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Dropdown Filters */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 sm:hidden"
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* 🏷️ Category */}
                <select
                  value={filters.category}
                  onChange={(e) => update("category", e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary text-sm shadow-sm"
                >
                  <option value="all">
                    {t("projects.filters.allCategories")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {currentLanguage === "lo"
                        ? cat.name_lo || cat.name_en
                        : cat.name_en || cat.name_lo}
                    </option>
                  ))}
                </select>

                {/* 📊 Status */}
                <select
                  value={filters.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary text-sm shadow-sm"
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

              {/* ❌ Clear Filters button */}
              <button
                onClick={onReset || reset}
                className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                {t("projects.search.clearFilters")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
