"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Category } from "@/types/category";

const CATEGORY_POSTING_FEES: Record<string, number> = {
  // Marketing
  "5qL77RdIESzkpoZjtRoQ": 10,
  // Copy Writing
  ACVAA2l5pPBtmoYllGlp: 10,
  // Design
  GZSyBzgtM66bvWIfkYje: 20,
  // Web Developer
  Kv3AmZ6kgMpqWaXN0MLK: 25,
  // Mobile Developer
  MaDKsBJWM3i6cyh5s1pt: 25,
};

const safeFee = (value: unknown) => {
  const fee = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(fee) || fee < 0) return 0;
  return Math.floor(fee);
};

export interface ProjectFormData {
  title: string;
  description: string;
  categoryId?: string;
  category?: { id: string; name_en: string; name_lo: string } | null;
  timeline: string;
  skillsRequired: string[];
  imageUrl: string;
  sampleImages?: string[];
  projectType: "client";
  maxFreelancers: number;
  visibility: "public" | "private";
  editQuota?: number;
  budget: number;
  postingFee: number;
}

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
  categories: Category[];
  categoriesLoading: boolean;
  timelines: Array<{ id: string; label: string }>;
}

export default function ProjectDetails({ formData, setFormData, t, categories, categoriesLoading, timelines }: Props) {
  const { currentLanguage } = useTranslationContext();

  const selectedPostingFee = useMemo(() => {
    const cat = categories.find((c: Category) => c.id === formData.categoryId);
    return (
      safeFee(cat?.postingFee) ||
      safeFee(CATEGORY_POSTING_FEES[formData.categoryId || ""]) ||
      safeFee(formData.postingFee)
    );
  }, [categories, formData.categoryId, formData.postingFee]);

  const labelFor = useMemo(
    () =>
      (cat: Category) =>
        currentLanguage === "lo"
          ? cat?.name_lo || cat?.name_en || cat?.id
          : cat?.name_en || cat?.name_lo || cat?.id,
    [currentLanguage]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t("createProject.projectDetails")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.detailsDesc")}
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.category")}
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => {
            const cat = categories.find((c: Category) => c.id === e.target.value);
            const fee = safeFee(cat?.postingFee) || safeFee(CATEGORY_POSTING_FEES[e.target.value]);
            setFormData((p: ProjectFormData) => ({
              ...p,
              categoryId: e.target.value,
              category: cat || null,
              postingFee: fee,
            }));
          }}
          disabled={categoriesLoading || categories.length === 0}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {categoriesLoading && <option value="">{t("common.loading") || "Loading categories…"}</option>}
          {!categoriesLoading && categories.length === 0 && <option value="">{t("createProject.noCategories") || "No categories available"}</option>}
          {!categoriesLoading && categories.length > 0 && (
            <>
              <option value="">{t("createProject.selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {labelFor(cat)}
                </option>
              ))}
            </>
          )}
        </select>
        {!categoriesLoading && categories.length === 0 && (
          <p className="text-xs text-error mt-2">{t("createProject.noCategoriesHelp") || "No categories found. Please contact support."}</p>
        )}
        {formData.categoryId && selectedPostingFee > 0 && (
          <p className="text-xs text-text-secondary mt-2">
            {(t("createProject.postingFeeApplied") as string) || "This category will apply the following posting fee:"}{" "}
            <span className="font-semibold text-primary">{selectedPostingFee} {t("createProject.credits")}</span>
          </p>
        )}
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.timeline")}
        </label>
        <select
          value={formData.timeline}
          onChange={(e) => setFormData((p: ProjectFormData) => ({ ...p, timeline: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        >
          <option value="">{t("createProject.selectTimeline") || "Select timeline"}</option>
          {timelines.map((tl) => (
            <option key={tl.id} value={tl.id}>
              {tl.label}
            </option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.budget")} (LAK)
        </label>
        <input
          type="number"
          value={formData.budget || ""}
          onChange={(e) => setFormData((p: ProjectFormData) => ({ ...p, budget: Number(e.target.value) || 0 }))}
          placeholder={t("createProject.budgetPlaceholder")}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Max Freelancers */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.maxFreelancers")}
        </label>
        <input
          type="number"
          min="1"
          value={formData.maxFreelancers}
          onChange={(e) => setFormData((p: ProjectFormData) => ({ ...p, maxFreelancers: Math.max(1, Number(e.target.value) || 1) }))}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.maxFreelancersDesc")}
        </p>
      </div>

      {/* Edit Quota */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.editQuota")}
        </label>
        <input
          type="number"
          min="1"
          max="3"
          value={formData.editQuota || 1}
          onChange={(e) => setFormData((p: ProjectFormData) => ({ ...p, editQuota: Math.min(3, Math.max(1, Number(e.target.value) || 1)) }))}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.editQuotaDesc")}
        </p>
      </div>
    </div>
  );
}
