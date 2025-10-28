import { useState, Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface PureFreelancerFieldsProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  colorScheme?: "primary" | "secondary";
}

export default function PureFreelancerFields({
  formData,
  setFormData,
  handleChange,
  colorScheme = "primary",
}: PureFreelancerFieldsProps) {
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
    colorScheme === "primary" ? "bg-primary-light/10" : "bg-secondary-light/10";
  const borderColor =
    colorScheme === "primary" ? "border-primary/20" : "border-secondary/20";
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
      ? "bg-primary-light text-primary"
      : "bg-secondary-light text-secondary";
  const iconColor =
    colorScheme === "primary" ? "text-primary" : "text-secondary";

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
              d="M9 17v-2a4 4 0 018 0v2M5 10a4 4 0 018 0v2a4 4 0 01-8 0v-2z"
            />
          </svg>
          {t("auth.signup.step2.pureFreelancerInfo.title")}
        </h4>

        {/* Bio */}
        <div className="mt-4 sm:mt-6">
          <label
            htmlFor="bio"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.pureFreelancerInfo.bio")}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
            placeholder={t(
              "auth.signup.step2.pureFreelancerInfo.bioPlaceholder"
            )}
          />
        </div>

        {/* Skills */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
            {t("auth.signup.step2.pureFreelancerInfo.skills")}
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
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 ${focusRing} focus:border-transparent transition-all duration-200`}
              placeholder={t("auth.signup.step2.pureFreelancerInfo.addSkill")}
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={addSkill}
              className={`px-4 sm:px-6 py-2 sm:py-3 ${btnColor} text-white rounded-lg transition-colors font-medium`}
            >
              {t("auth.signup.step2.pureFreelancerInfo.addSkillButton")}
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
                  className={`${iconColor} hover:opacity-80 text-lg`}
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
