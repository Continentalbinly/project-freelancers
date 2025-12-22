"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import ImageUploadField from "../ImageUploadField";
import type { SignupCredentials } from "@/types/auth";
import { BookOpen, ChevronDown, Check, X, Plus } from "lucide-react";

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
  const { t, currentLanguage } = useTranslationContext();
  const [isOccupationOpen, setIsOccupationOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const occupationRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        occupationRef.current &&
        !occupationRef.current.contains(event.target as Node)
      ) {
        setIsOccupationOpen(false);
      }
      if (
        genderRef.current &&
        !genderRef.current.contains(event.target as Node)
      ) {
        setIsGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (!trimmedSkill) return;
    
    const currentSkills = formData.skills || [];
    // Check if skill already exists
    if (currentSkills.includes(trimmedSkill)) {
      setError(t("auth.signup.errors.skillExists") || "Skill already added");
      setTimeout(() => setError(""), 3000);
      setSkillInput("");
      return;
    }

    // Check skill limit
    if (currentSkills.length >= 5) {
      setError(t("auth.signup.errors.skillLimit") || "Maximum 5 skills allowed");
      setTimeout(() => setError(""), 3000);
      setSkillInput("");
      return;
    }

    setFormData({ ...formData, skills: [...currentSkills, trimmedSkill] });
    setSkillInput("");
    setError("");
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = formData.skills || [];
    setFormData({
      ...formData,
      skills: currentSkills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    } else if (e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const occupationOptions =
    formData.role === "freelancer"
      ? [
          {
            value: "developer",
            label: t("auth.signup.occupations.developer") || "Developer",
          },
          {
            value: "designer",
            label: t("auth.signup.occupations.designer") || "Designer",
          },
          {
            value: "writer",
            label: t("auth.signup.occupations.writer") || "Writer",
          },
          {
            value: "marketer",
            label: t("auth.signup.occupations.marketer") || "Marketer",
          },
          {
            value: "other",
            label: t("auth.signup.occupations.other") || "Other",
          },
        ]
      : [
          {
            value: "startup",
            label: t("auth.signup.occupations.startup") || "Startup",
          },
          {
            value: "agency",
            label: t("auth.signup.occupations.agency") || "Agency",
          },
          {
            value: "corporate",
            label: t("auth.signup.occupations.corporate") || "Corporate",
          },
          {
            value: "individual",
            label: t("auth.signup.occupations.individual") || "Individual",
          },
          {
            value: "other",
            label: t("auth.signup.occupations.other") || "Other",
          },
        ];

  const selectedOccupationLabel = (() => {
    if (!formData.occupation) {
      return t("auth.signup.placeholders.selectOption") || "Select...";
    }
    if (typeof formData.occupation === "object") {
      return currentLanguage?.startsWith("lo")
        ? formData.occupation.name_lo
        : formData.occupation.name_en;
    }
    return t("auth.signup.placeholders.selectOption") || "Select...";
  })();

  const buildOccupationObject = (id: string) => {
    const enTranslations = en as unknown as Record<string, any>;
    const loTranslations = lo as unknown as Record<string, any>;
    const enName = enTranslations?.auth?.signup?.occupations?.[id] || id;
    const loName = loTranslations?.auth?.signup?.occupations?.[id] || id;
    return { id, name_en: enName, name_lo: loName };
  };

  const genderOptions = [
    {
      value: "male",
      label: t("auth.signup.gender.male") || "Male",
    },
    {
      value: "female",
      label: t("auth.signup.gender.female") || "Female",
    },
    {
      value: "other",
      label: t("auth.signup.gender.other") || "Other",
    },
    {
      value: "prefer_not_to_say",
      label: t("auth.signup.gender.preferNotToSay") || "Prefer not to say",
    },
  ];

  const selectedGenderLabel = (() => {
    if (!formData.gender) {
      return t("auth.signup.placeholders.selectOption") || "Select...";
    }
    const option = genderOptions.find((opt) => opt.value === formData.gender);
    return option ? option.label : t("auth.signup.placeholders.selectOption") || "Select...";
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.profile.title") || "Complete your profile"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.profile.subtitle") ||
            "Optional: Add a photo and showcase your expertise"}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Profile Picture */}
        <ImageUploadField
          label={t("auth.signup.fields.profilePicture") || "Profile Picture"}
          value={formData.avatarUrl || ""}
          onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
          uploading={uploading}
          setUploading={setUploading}
          error={error}
          setError={setError}
        />

        {/* Occupation */}
        <div>
          <label
            htmlFor="occupation"
            className="block text-sm font-medium text-text mb-2"
          >
            {formData.role === "freelancer"
              ? t("auth.signup.fields.profession") || "Profession"
              : t("auth.signup.fields.companyType") || "Company Type"}
          </label>
          <div className="relative" ref={occupationRef}>
            <button
              type="button"
              className="ui-select pr-10 flex items-center justify-between"
              onClick={() => setIsOccupationOpen((o) => !o)}
            >
              <span className="truncate">{selectedOccupationLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform ${
                  isOccupationOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOccupationOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-background shadow-lg max-h-56 overflow-y-auto">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => {
                    setFormData({ ...formData, occupation: undefined });
                    setIsOccupationOpen(false);
                  }}
                >
                  {t("auth.signup.placeholders.selectOption") || "Select..."}
                </button>
                {occupationOptions.map((option) => {
                  const isSelected =
                    typeof formData.occupation === "object" &&
                    formData.occupation?.id === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-background-secondary dark:hover:bg-background-secondary-dark ${
                        isSelected ? "bg-primary-light text-primary" : ""
                      }`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          occupation: buildOccupationObject(option.value),
                        });
                        setIsOccupationOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-text"
            >
              {formData.role === "freelancer"
                ? t("auth.signup.fields.bio.freelancer") || "About you"
                : t("auth.signup.fields.bio.client") || "About your company"}
            </label>
            <span className="text-xs text-text-secondary">
              {(formData.bio || '').length}/300
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
                : t("auth.signup.placeholders.bioClient") ||
                  "Tell freelancers about your company..."
            }
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-text-secondary">
            {t("auth.signup.fields.bioHint") ||
              "This helps freelancers understand who you are"}
          </p>
        </div>

        {/* Skills (Freelancer only) */}
        {formData.role === "freelancer" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-text"
              >
                {t("auth.signup.fields.skills") || "Top Skills"}
              </label>
              <span
                className={`text-xs font-medium ${
                  (formData.skills || []).length >= 5
                    ? "text-error"
                    : "text-text-secondary"
                }`}
              >
                {(formData.skills || []).length}/5{" "}
                {t("auth.signup.fields.skillsUnit") || "skills"}
              </span>
            </div>

            {/* Skills Input */}
            <div className="flex gap-2 mb-3">
              <input
                id="skills"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillInputKeyPress}
                placeholder={
                  (formData.skills || []).length >= 5
                    ? t("auth.signup.placeholders.skillsLimit") ||
                      "Maximum 5 skills reached"
                    : t("auth.signup.placeholders.skills") ||
                      "Type a skill and press Enter or comma"
                }
                disabled={(formData.skills || []).length >= 5}
                className={`flex-1 px-4 py-3 rounded-lg border-2 bg-background text-text focus:outline-none focus:border-primary transition-colors ${
                  (formData.skills || []).length >= 5
                    ? "border-border/50 opacity-50 cursor-not-allowed"
                    : "border-border"
                }`}
              />
              <button
                type="button"
                onClick={addSkill}
                disabled={(formData.skills || []).length >= 5 || !skillInput.trim()}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  (formData.skills || []).length >= 5 || !skillInput.trim()
                    ? "bg-background-secondary text-text-secondary cursor-not-allowed opacity-50"
                    : "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg"
                }`}
              >
                <Plus className="w-4 h-4" />
                {t("common.add") || "Add"}
              </button>
            </div>

            {/* Skills Display */}
            {(formData.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.skills || []).map((skill) => (
                  <div
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary text-sm font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-primary hover:text-primary-hover transition-colors focus:outline-none"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hint */}
            <p className="mt-1 text-xs text-text-secondary">
              {(formData.skills || []).length >= 5
                ? t("auth.signup.fields.skillsLimitReached") ||
                  "Maximum 5 skills reached. Remove a skill to add another."
                : t("auth.signup.fields.skillsHint") ||
                  "Type a skill and press Enter, comma, or click Add. Maximum 5 skills."}
            </p>
          </div>
        )}

        {/* Date of Birth */}
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.dateOfBirth") || "Date of Birth"}
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.gender") || "Gender"}
          </label>
          <div className="relative" ref={genderRef}>
            <button
              type="button"
              className="ui-select pr-10 flex items-center justify-between w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
              onClick={() => setIsGenderOpen((o) => !o)}
            >
              <span className="truncate text-left">{selectedGenderLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ml-2 ${
                  isGenderOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isGenderOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-background shadow-lg max-h-56 overflow-y-auto">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-background-secondary dark:hover:bg-background-secondary-dark"
                  onClick={() => {
                    setFormData({ ...formData, gender: undefined });
                    setIsGenderOpen(false);
                  }}
                >
                  {t("auth.signup.placeholders.selectOption") || "Select..."}
                </button>
                {genderOptions.map((option) => {
                  const isSelected = formData.gender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-background-secondary dark:hover:bg-background-secondary-dark ${
                        isSelected ? "bg-primary-light text-primary" : ""
                      }`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          gender: option.value as "male" | "female" | "other" | "prefer_not_to_say",
                        });
                        setIsGenderOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.phone") || "Phone Number"}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder={t("auth.signup.placeholders.phone") || "+856 20 1234 5678"}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.country") || "Country"}
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={formData.country || ""}
            onChange={handleChange}
            placeholder={t("auth.signup.placeholders.country") || "Lao PDR"}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.city") || "City"}
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder={t("auth.signup.placeholders.city") || "Vientiane"}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Location (Street/Address) */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.location") || "Address"}
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder={t("auth.signup.placeholders.location") || "Street address or district"}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.website") || "Website"}
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website || ""}
            onChange={handleChange}
            placeholder={t("auth.signup.placeholders.website") || "https://yourwebsite.com"}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-text focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Info Box */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{
          backgroundColor: "color-mix(in oklab, var(--info) 10%, transparent)",
          border: "1px solid color-mix(in oklab, var(--info) 30%, transparent)",
          color: "var(--info)",
        }}
      >
        <p className="font-medium mb-1">
          <BookOpen className="inline-block w-5 h-5 mr-1" />{" "}
          {t("common.tip") || "Tip"}:
        </p>
        <p>
          {t("auth.signup.steps.profile.tip") ||
            "A complete profile helps you stand out and attract more opportunities. You can edit this later."}
        </p>
      </div>
    </div>
  );
}
