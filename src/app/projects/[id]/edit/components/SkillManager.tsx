// components/SkillManager.tsx
"use client";

import { useState, useEffect } from "react";

const CATEGORY_SKILLS: Record<string, string[]> = {
  Kv3AmZ6kgMpqWaXN0MLK: ["Frontend", "Backend", "React", "Next.js", "Laravel"],
  MaDKsBJWM3i6cyh5s1pt: ["Flutter", "React Native", "iOS", "Android"],
  "5qL77RdIESzkpoZjtRoQ": ["SEO", "Facebook Ads", "Marketing"],
  ACVAA2l5pPBtmoYllGlp: ["Copywriting", "Product Description"],
  GZSyBzgtM66bvWIfkYje: ["UI/UX", "Logo", "Branding"],
};

export default function SkillManager({ formData, setFormData, t }: any) {
  const [skillInput, setSkillInput] = useState("");
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  useEffect(() => {
    setSuggestedSkills(CATEGORY_SKILLS[formData.categoryId] || []);
  }, [formData.categoryId]);

  const addSkill = (skillText?: string) => {
    const clean = (skillText ?? skillInput).trim();
    if (!clean) return;

    if (formData.skillsRequired.includes(clean)) return;

    setFormData((prev: any) => ({
      ...prev,
      skillsRequired: [...prev.skillsRequired, clean],
    }));

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setFormData((prev: any) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s: string) => s !== skill),
    }));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {t("editProject.skillsRequired")}
      </label>

      {/* Input + Add button */}
      <div className="flex gap-2">
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="flex-1 px-3 py-2 border border-border rounded-lg"
          placeholder={(t("editProject.eGReactNodeJsUiUxDesign"))}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => addSkill()}
        >
          {t("createProject.add")}
        </button>
      </div>

      {/* Suggested Skills */}
      {suggestedSkills.length > 0 && (
        <div className="flex gap-2 flex-wrap text-sm">
          {suggestedSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              onClick={() => addSkill(skill)} // ✅ Auto-add on click
              className="px-3 py-1 bg-gray-100 cursor-pointer rounded-full hover:bg-gray-200 transition"
            >
              + {skill}
            </button>
          ))}
        </div>
      )}

      {/* Selected Skills */}
      <div className="flex flex-wrap gap-2">
        {formData.skillsRequired.map((skill: string) => (
          <span
            key={skill}
            className="px-3 py-1 bg-primary-light text-primary rounded-full flex items-center cursor-pointer"
          >
            {skill}
            <button
              type="button"
              className="ml-2 text-red-600 cursor-pointer"
              onClick={() => removeSkill(skill)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
