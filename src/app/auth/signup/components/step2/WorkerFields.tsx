import { useState, Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface WorkerFieldsProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  colorScheme?: "primary" | "secondary";
  labels?: {
    title?: string;
    company?: string;
    companyPlaceholder?: string;
  };
}

export default function WorkerFields({
  formData,
  setFormData,
  handleChange,
  colorScheme = "primary",
  labels,
}: WorkerFieldsProps) {
  const { t } = useTranslationContext();
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }));
  };

  // Dynamic styling based on colorScheme prop
  const bgColor =
    colorScheme === "primary"
      ? "bg-primary/10"
      : "bg-secondary/10";
  const borderColor =
    colorScheme === "primary"
      ? "border-primary/20"
      : "border-secondary/20";
  const textColor =
    colorScheme === "primary" ? "text-primary" : "text-secondary";
  const focusRing =
    colorScheme === "primary" ? "focus:ring-primary" : "focus:ring-secondary";
  const btnColor =
    colorScheme === "primary"
      ? "bg-primary hover:bg-primary-hover"
      : "bg-secondary hover:bg-secondary-hover";
  const badgeBg =
    colorScheme === "primary"
      ? "bg-primary/10 text-primary"
      : "bg-secondary/10 text-secondary";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className={`${bgColor} rounded-xl p-4 sm:p-6 border ${borderColor}`}>
        <h4
          className={`font-semibold ${textColor} mb-3 sm:mb-4 flex items-center`}
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
            />
          </svg>
          {labels?.title || t("auth.signup.step2.workerInfo.title")}
        </h4>

        {/* Company and Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="institution"
              className="block text-sm font-semibold   mb-2 sm:mb-3"
            >
              {labels?.company || t("auth.signup.step2.workerInfo.company")}
            </label>
            <input
              suppressHydrationWarning
              id="institution"
              name="institution"
              type="text"
              value={formData.institution}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={
                labels?.companyPlaceholder ||
                t("auth.signup.step2.workerInfo.companyPlaceholder")
              }
            />
          </div>
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-semibold   mb-2 sm:mb-3"
            >
              {t("auth.signup.step2.workerInfo.department")}
            </label>
            <input
              suppressHydrationWarning
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={t(
                "auth.signup.step2.workerInfo.departmentPlaceholder"
              )}
            />
          </div>
        </div>

        {/* Position and Years of Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-semibold   mb-2 sm:mb-3"
            >
              {t("auth.signup.step2.workerInfo.position")}
            </label>
            <input
              suppressHydrationWarning
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={t(
                "auth.signup.step2.workerInfo.positionPlaceholder"
              )}
            />
          </div>
          <div>
            <label
              htmlFor="yearsOfExperience"
              className="block text-sm font-semibold   mb-2 sm:mb-3"
            >
              {t("auth.signup.step2.workerInfo.yearsOfExperience")}
            </label>
            <input
              suppressHydrationWarning
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              min="0"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={t(
                "auth.signup.step2.workerInfo.yearsOfExperiencePlaceholder"
              )}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 sm:mt-6">
          <label
            htmlFor="bio"
            className="block text-sm font-semibold   mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.workerInfo.bio")}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
            placeholder={t("auth.signup.step2.workerInfo.bioPlaceholder")}
          />
        </div>

        {/* Skills */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-sm font-semibold   mb-2 sm:mb-3">
            {t("auth.signup.step2.workerInfo.skills")}
          </label>
          <div className="flex gap-2 mb-3">
            <input
              suppressHydrationWarning
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={t("auth.signup.step2.workerInfo.addSkill")}
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={addSkill}
              className={`px-4 sm:px-6 py-2 sm:py-3 ${btnColor} text-white rounded-lg transition-colors font-medium`}
            >
              {t("auth.signup.step2.workerInfo.addSkillButton")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills?.map((skill, index) => (
              <span
                key={index}
                className={`px-2 sm:px-3 py-1 sm:py-2 ${badgeBg} rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium`}
              >
                {skill}
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className={`${textColor} hover:opacity-80 text-lg`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
