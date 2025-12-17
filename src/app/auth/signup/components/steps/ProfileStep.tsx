"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import ImageUploadField from "../ImageUploadField";
import type { SignupCredentials } from "@/types/auth";

interface ProfileStepProps {
  formData: SignupCredentials;
  setFormData: (data: SignupCredentials) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  error: string;
  setError: (error: string) => void;
}

export default function ProfileStep({
  formData,
  setFormData,
  uploading,
  setUploading,
  error,
  setError,
}: ProfileStepProps) {
  const { t } = useTranslationContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const skills = value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
    setFormData({ ...formData, skills });
  };

  const occupationOptions =
    formData.role === "freelancer"
      ? [
          { value: "developer", label: t("auth.signup.occupations.developer") || "Developer" },
          { value: "designer", label: t("auth.signup.occupations.designer") || "Designer" },
          { value: "writer", label: t("auth.signup.occupations.writer") || "Writer" },
          { value: "marketer", label: t("auth.signup.occupations.marketer") || "Marketer" },
          { value: "other", label: t("auth.signup.occupations.other") || "Other" },
        ]
      : [
          { value: "startup", label: t("auth.signup.occupations.startup") || "Startup" },
          { value: "agency", label: t("auth.signup.occupations.agency") || "Agency" },
          { value: "corporate", label: t("auth.signup.occupations.corporate") || "Corporate" },
          { value: "individual", label: t("auth.signup.occupations.individual") || "Individual" },
          { value: "other", label: t("auth.signup.occupations.other") || "Other" },
        ];

  const buildOccupationObject = (id: string) => {
    const enName = (en as any)?.auth?.signup?.occupations?.[id] || id;
    const loName = (lo as any)?.auth?.signup?.occupations?.[id] || id;
    return { id, name_en: enName, name_lo: loName };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.profile.title") || "Complete your profile"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.profile.subtitle") || "Optional: Add a photo and showcase your expertise"}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Profile Picture */}
        <ImageUploadField
          label={t("auth.signup.fields.profilePicture") || "Profile Picture"}
          value={formData.avatarUrl}
          onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
          uploading={uploading}
          setUploading={setUploading}
          error={error}
          setError={setError}
        />

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className="block text-sm font-medium text-text mb-2">
            {formData.role === "freelancer"
              ? t("auth.signup.fields.profession") || "Profession"
              : t("auth.signup.fields.companyType") || "Company Type"}
          </label>
          <select
            id="occupation"
            name="occupation"
            value={typeof formData.occupation === "object" ? formData.occupation?.id : formData.occupation || ""}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value ? buildOccupationObject(e.target.value) : undefined })}
            className="ui-select"
          >
            <option value="">
              {t("auth.signup.placeholders.selectOption") || "Select..."}
            </option>
            {occupationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="bio" className="block text-sm font-medium text-text">
              {formData.role === "freelancer"
                ? t("auth.signup.fields.bio.freelancer") || "About you"
                : t("auth.signup.fields.bio.client") || "About your company"}
            </label>
            <span className="text-xs text-text-secondary">
              {formData.bio.length}/300
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={300}
            placeholder={
              formData.role === "freelancer"
                ? t("auth.signup.placeholders.bioFreelancer") ||
                  "Tell clients about your experience and skills..."
                : t("auth.signup.placeholders.bioClient") || "Tell freelancers about your company..."
            }
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-text-secondary">
            {t("auth.signup.fields.bioHint") || "This helps freelancers understand who you are"}
          </p>
        </div>

        {/* Skills (Freelancer only) */}
        {formData.role === "freelancer" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="skills" className="block text-sm font-medium text-text">
                {t("auth.signup.fields.skills") || "Top Skills"}
              </label>
              <span className="text-xs text-text-secondary">
                {formData.skills.length}/5 {t("auth.signup.fields.skillsUnit") || "skills"}
              </span>
            </div>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills.join(", ")}
              onChange={handleSkillsChange}
              placeholder={
                t("auth.signup.placeholders.skills") ||
                "e.g. React, UI Design, Content Writing (separated by comma)"
              }
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
            />
            <p className="mt-1 text-xs text-text-secondary">
              {t("auth.signup.fields.skillsHint") || "Add up to 5 skills separated by commas"}
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "color-mix(in oklab, var(--info) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--info) 30%, transparent)", color: "var(--info)" }}>
        <p className="font-medium mb-1">📋 {t("common.tip") || "Tip"}:</p>
        <p>
          {t("auth.signup.steps.profile.tip") ||
            "A complete profile helps you stand out and attract more opportunities. You can edit this later."}
        </p>
      </div>
    </div>
  );
}
