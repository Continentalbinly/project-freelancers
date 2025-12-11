"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import { Dispatch, SetStateAction } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { ProjectFormData } from "../page";
import { CATEGORY_POSTING_FEE } from "../postingFeeConfig";

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

  // Predefined fixed budgets
  const predefinedBudgets = [100000, 300000, 500000, 1000000, 2000000, 5000000];

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
        console.log("❌ Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []);

  // Category label (auto language)
  const getCategoryLabel = (cat: Category) =>
    activeLang === "lo"
      ? cat.name_lo || cat.name_en
      : cat.name_en || cat.name_lo;

  // Select category
  const handleSelectCategory = (cat: Category) => {
    const postingFee = CATEGORY_POSTING_FEE[cat.id] ?? 0;

    setFormData((prev) => ({
      ...prev,
      categoryId: cat.id,
      category: {
        id: cat.id,
        name_en: cat.name_en,
        name_lo: cat.name_lo,
      },
      postingFee,
    }));
  };

  // Select predefined budget
  const handleBudgetSelect = (amount: number) => {
    setFormData((prev) => ({
      ...prev,
      budget: amount,
    }));
  };

  // Custom budget input
  const handleCustomBudget = (value: string) => {
    const num = Number(value.replace(/\D/g, "")); // clean non-numbers
    setFormData((prev) => ({
      ...prev,
      budget: num,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold   mb-1">
          {t("createProject.projectDetails")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.detailsDesc")}
        </p>
      </div>

      {/* CATEGORY SELECTION */}
      <div>
        <label className="block text-sm font-semibold mb-2  ">
          {t("createProject.category")}
        </label>

        {loadingCategories ? (
          <div className="h-20 rounded-lg animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const label = getCategoryLabel(cat);
              const fee = CATEGORY_POSTING_FEE[cat.id] ?? 0;
              const selected = formData.categoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? "border-primary bg-primary-light/10 shadow-sm"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold  ">{label}</div>
                  <div className="text-sm text-text-secondary mt-1">
                    {t("createProject.postingFee")}:{" "}
                    <span className="text-primary font-semibold">
                      {fee} {t("createProject.credits")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!formData.categoryId && (
          <p className="text-xs mt-1 text-red-500">
            {t("createProject.selectCategoryWarning")}
          </p>
        )}
      </div>

      {/* TIMELINE */}
      <div>
        <label className="block text-sm font-semibold mb-2  ">
          {t("createProject.timeline")}
        </label>
        <select
          value={formData.timeline}
          onChange={(e) =>
            setFormData((p) => ({ ...p, timeline: e.target.value }))
          }
          className="border border-border rounded-lg px-3 py-2 w-full cursor-pointer focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">{t("createProject.selectTimeline")}</option>
          {timelines.map((tline) => (
            <option key={tline}>{tline}</option>
          ))}
        </select>
      </div>

      {/* PROJECT BUDGET (OPTION C: predefined + custom input) */}
      <div>
        <label className="block text-sm font-semibold mb-2  ">
          {t("createProject.projectBudget")}
        </label>

        {/* Predefined amounts */}
        <div className="flex flex-wrap gap-3">
          {predefinedBudgets.map((amount) => {
            const selected = Number(formData.budget) === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handleBudgetSelect(amount)}
                className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${
                  selected
                    ? "bg-primary text-white border-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                ₭{amount.toLocaleString()}
              </button>
            );
          })}
        </div>

        {/* Custom amount input */}
        <div className="mt-4">
          <input
            type="text"
            value={formData.budget ? formData.budget.toLocaleString() : ""}
            onChange={(e) => handleCustomBudget(e.target.value)}
            placeholder={t("createProject.projectBudgetPlaceholder")}
            className="border border-border rounded-lg px-3 py-2 w-full"
          />
          <p className="text-xs text-text-secondary mt-1">
            {t("createProject.projectBudgetNote")}
          </p>
        </div>
      </div>

      {/* Posting fee preview */}
      {formData.postingFee > 0 && (
        <div className="p-4 border border-border rounded-lg shadow-sm">
          <p className="text-sm text-text-secondary">
            {t("createProject.postingFeeApplied")}
          </p>
          <p className="text-lg font-semibold text-primary mt-1">
            {formData.postingFee} {t("createProject.credits")}
          </p>
        </div>
      )}
    </div>
  );
}
