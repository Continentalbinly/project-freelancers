import { Dispatch, SetStateAction, useState } from "react";
import { ProjectFormData } from "../page";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
}

export default function Step4Requirements({ formData, setFormData, t }: Props) {
  const [skill, setSkill] = useState("");

  const addSkill = () => {
    if (skill.trim() && !formData.skillsRequired.includes(skill.trim())) {
      setFormData((p) => ({
        ...p,
        skillsRequired: [...p.skillsRequired, skill.trim()],
      }));
      setSkill("");
    }
  };

  const removeSkill = (s: string) =>
    setFormData((p) => ({
      ...p,
      skillsRequired: p.skillsRequired.filter((i) => i !== s),
    }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.requirements")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.requirementsDesc")}
        </p>
      </div>

      {/* Skills input */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.skillsRequired")}
        </label>
        <div className="flex gap-2">
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="border border-border rounded-lg flex-1 px-3 py-2"
            placeholder={t("createProject.skillPlaceholder")}
          />
          <button
            onClick={addSkill}
            type="button"
            className="btn btn-primary px-4"
          >
            {t("createProject.add")}
          </button>
        </div>
      </div>

      {/* Display added skills */}
      <div className="flex flex-wrap gap-2">
        {formData.skillsRequired.map((s, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-primary-light text-primary rounded-full flex items-center"
          >
            {s}
            <button onClick={() => removeSkill(s)} className="ml-2 text-sm">
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.deadline")}
        </label>
        <input
          type="date"
          value={formData.deadline}
          onChange={(e) =>
            setFormData((p) => ({ ...p, deadline: e.target.value }))
          }
          className="border border-border rounded-lg px-3 py-2"
        />
      </div>
    </div>
  );
}
