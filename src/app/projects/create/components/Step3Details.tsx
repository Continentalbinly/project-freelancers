"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import { Dispatch, SetStateAction } from "react";
import { ProjectFormData } from "../page";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
}

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

export default function Step3Details({ formData, setFormData, t }: Props) {
  const { currentLanguage } = useTranslationContext();
  const activeLang = currentLanguage || "en";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const timelines = [
    t("createProject.lessThan1Week"),
    t("createProject.oneToTwoWeeks"),
    t("createProject.oneToTwoMonths"),
  ];

  useEffect(() => {
    async function fetchCategories() {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Category, "id">),
        }));
        setCategories(data);
      } catch (err) {
        //console.error("❌ Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryChange = (id: string) => {
    const selected = categories.find((c) => c.id === id);
    if (!selected) return;
    setFormData((p) => ({
      ...p,
      categoryId: selected.id,
      category: {
        id: selected.id,
        name_en: selected.name_en,
        name_lo: selected.name_lo,
      },
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.projectDetails")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.detailsDesc")}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-text-primary">
          {t("createProject.category")}
        </label>

        {loadingCategories ? (
          <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : categories.length === 0 ? (
          <div className="text-sm text-text-secondary italic">
            {t("createProject.noCategoriesFound") || "No categories available."}
          </div>
        ) : (
          <select
            value={formData.categoryId || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">{t("createProject.selectCategory")}</option>
            {categories.map((cat) => {
              const label =
                activeLang === "lo"
                  ? cat.name_lo || cat.name_en
                  : cat.name_en || cat.name_lo;

              return (
                <option key={cat.id} value={cat.id}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-text-primary">
          {t("createProject.budget")}
        </label>
        <input
          type="number"
          min={1}
          value={formData.budget}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              budget: e.target.value,
              budgetType: "fixed",
            }))
          }
          placeholder={t("createProject.budgetPlaceholder")}
          className="border border-border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary outline-none"
        />
        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.fixedPriceOnly")}
        </p>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-text-primary">
          {t("createProject.timeline")}
        </label>
        <select
          value={formData.timeline}
          onChange={(e) =>
            setFormData((p) => ({ ...p, timeline: e.target.value }))
          }
          className="border border-border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">{t("createProject.selectTimeline")}</option>
          {timelines.map((tline) => (
            <option key={tline}>{tline}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
