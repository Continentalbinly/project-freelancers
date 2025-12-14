"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { TIMELINE_OPTIONS } from "@/service/timelineUtils";

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
  t: (key: string) => string;
  previewUrl: string;
  postingFee?: number;
  credits?: number;
  isEdit?: boolean;
}

export default function ProjectReview({
  formData,
  t,
  previewUrl,
  postingFee = 0,
  credits = 0,
  isEdit = false,
}: Props) {
  const { currentLanguage } = useTranslationContext();

  // Get timeline label based on current language
  const getTimelineLabel = (timelineId: string) => {
    const option = TIMELINE_OPTIONS.find(opt => opt.id === timelineId);
    if (!option) return timelineId;
    return currentLanguage === 'lo' ? option.label_lo : option.label_en;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t("createProject.reviewSubmit")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.reviewDesc")}
        </p>
      </div>

      <div className="space-y-4">
        {/* Project Preview Card */}
        <div className="border border-border rounded-lg overflow-hidden">
          {(previewUrl || formData.imageUrl) && (
            <img
              src={previewUrl || formData.imageUrl}
              alt="Project"
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 sm:p-6 space-y-3">
            <div>
              <p className="text-xs text-text-secondary mb-1">{t("createProject.title")}</p>
              <h3 className="text-lg font-bold text-text-primary">{formData.title}</h3>
            </div>

            <div>
              <p className="text-xs text-text-secondary mb-1">{t("createProject.description")}</p>
              <p className="text-sm text-text-primary line-clamp-3">{formData.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-text-secondary">{t("createProject.budget")}</p>
                <p className="font-semibold text-text-primary">
                  ₭{formData.budget?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">{t("createProject.timeline")}</p>
                <p className="font-semibold text-text-primary">
                  {formData.timeline ? getTimelineLabel(formData.timeline) : "N/A"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-text-secondary mb-2">{t("createProject.category")}</p>
              <p className="text-sm font-medium text-primary">
                {formData.category?.name_en || "Not selected"}
              </p>
            </div>

            {formData.skillsRequired.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-secondary mb-2">{t("createProject.skillsRequired")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cost Summary - Only show for create, not edit */}
        {!isEdit && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-text-primary">{t("createProject.postingFee")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">{t("createProject.projectBudget")}</span>
                <span className="font-medium text-text-primary">
                  ₭{formData.budget?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">{t("createProject.postingFee")}</span>
                <span className="font-medium text-primary">
                  {postingFee} {t("createProject.credits")}
                </span>
              </div>
              <div className="h-px bg-border"></div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-text-primary">{t("createProject.yourCredits")}</span>
                <span className={`font-bold ${credits >= postingFee ? "text-success" : "text-error"}`}>
                  {credits} {t("createProject.credits")}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isEdit && postingFee > credits && (
          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <p className="text-sm text-error font-medium">
              {t("createProject.insufficientCreditsMessage")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
