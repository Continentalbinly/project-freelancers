"use client";

import { Dispatch, SetStateAction } from "react";

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
}

export default function ProjectBasics({ formData, setFormData, t }: Props) {
  const TITLE_MIN = 5;
  const TITLE_MAX = 120;
  const DESC_MIN = 20;
  const DESC_MAX = 5000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t("createProject.basicInformation")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.basicInfoDesc")}
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.projectTitle")}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value.slice(0, TITLE_MAX) }))
          }
          maxLength={TITLE_MAX}
          placeholder={t("createProject.titlePlaceholder")}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>
            {formData.title.length} / {TITLE_MIN}+ / {TITLE_MAX}
          </span>
          <span>
            {t("createProject.minMaxHelper") || "Min/Max characters"}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.projectDescription")}
        </label>
        <textarea
          rows={6}
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value.slice(0, DESC_MAX) }))
          }
          maxLength={DESC_MAX}
          placeholder={t("createProject.descriptionPlaceholder")}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="text-xs text-text-secondary mt-1">
          {formData.description.length} / {DESC_MIN}+ / {DESC_MAX} {t("createProject.chars") || "characters"}
        </p>
      </div>
    </div>
  );
}
