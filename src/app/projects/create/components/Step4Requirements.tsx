"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { ProjectFormData } from "../page";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
}

// 🔥 Suggested skills per category (editable anytime)
const CATEGORY_SKILLS: Record<string, string[]> = {
  Kv3AmZ6kgMpqWaXN0MLK: [
    "Frontend",
    "Backend",
    "React",
    "Next.js",
    "Laravel",
    "API Integration",
    "Database Design",
  ],

  MaDKsBJWM3i6cyh5s1pt: [
    "Flutter",
    "React Native",
    "iOS Development",
    "Android Development",
    "Mobile UI",
  ],

  "5qL77RdIESzkpoZjtRoQ": [
    "Digital Marketing",
    "Facebook Ads",
    "SEO",
    "Content Strategy",
    "Campaign Management",
  ],

  ACVAA2l5pPBtmoYllGlp: [
    "Ad Copy",
    "Product Description",
    "Proofreading",
    "Content Writing",
    "Script Writing",
  ],

  GZSyBzgtM66bvWIfkYje: [
    "UI/UX Design",
    "Logo Design",
    "Brand Identity",
    "Illustration",
    "Graphic Design",
  ],
};

export default function Step4Requirements({ formData, setFormData, t }: Props) {
  const [skill, setSkill] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  // Load suggested skills on category selection
  useEffect(() => {
    if (!formData.categoryId) return;
    const skills = CATEGORY_SKILLS[formData.categoryId] ?? [];
    setSuggestedSkills(skills);
  }, [formData.categoryId]);

  // Add skill manually
  const addSkill = (value?: string) => {
    const clean = (value ?? skill).trim();
    if (!clean) return;

    const exists = formData.skillsRequired.some(
      (s) => s.toLowerCase() === clean.toLowerCase()
    );

    if (!exists) {
      setFormData((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, clean],
      }));
    }

    // clear input only if adding from input
    if (!value) setSkill("");
  };

  // Add skill by pressing Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Auto-add from suggested list
  const handleSuggestedClick = (s: string) => {
    addSkill(s); // ⭐ instant add
  };

  const removeSkill = (s: string) =>
    setFormData((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((i) => i !== s),
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.requirements")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.requirementsDesc")}
        </p>
      </div>

      {/* Manual skill input */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.skillsRequired")}
        </label>

        <div className="flex gap-2">
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border border-border rounded-lg flex-1 px-3 py-2"
            placeholder={t("createProject.skillPlaceholder")}
          />

          <button
            onClick={() => addSkill()}
            type="button"
            className="btn btn-primary px-4"
          >
            {t("createProject.add")}
          </button>
        </div>
      </div>

      {/* Suggested Skills */}
      {suggestedSkills.length > 0 && (
        <div>
          <p className="text-xs text-text-secondary mb-2">
            {t("createProject.suggestedSkills")}
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestedClick(s)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display added skills */}
      {formData.skillsRequired.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.skillsRequired.map((s, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-primary-light text-primary rounded-full flex items-center"
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                className="ml-2 text-sm hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
