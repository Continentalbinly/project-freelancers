"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { X, Plus } from "lucide-react";

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

export default function ProjectRequirements({ formData, setFormData, t }: Props) {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired.includes(skillInput.trim())) {
      setFormData((p: ProjectFormData) => ({
        ...p,
        skillsRequired: [...p.skillsRequired, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((p: ProjectFormData) => ({
      ...p,
      skillsRequired: p.skillsRequired.filter((s: string) => s !== skill),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t("createProject.requirements")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.requirementsDesc")}
        </p>
      </div>

      {/* Skills Required */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.skillsRequired")}
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
            placeholder={t("createProject.skillPlaceholder")}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("createProject.add")}
          </button>
        </div>

        {/* Skills List */}
        <div className="flex flex-wrap gap-2">
          {formData.skillsRequired.map((skill: string) => (
            <div
              key={skill}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
            >
              <span className="text-sm font-medium text-primary">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
