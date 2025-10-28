import { useState, Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface StudentFieldsProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function StudentFields({
  formData,
  setFormData,
  handleChange,
}: StudentFieldsProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-primary-light/10 rounded-xl p-4 sm:p-6 border border-primary/20">
        <h4 className="font-semibold text-primary mb-3 sm:mb-4 flex items-center">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {t("auth.signup.step2.studentInfo.title")}
        </h4>

        {/* University and Field of Study */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label
              htmlFor="university"
              className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
            >
              {t("auth.signup.step2.studentInfo.university")}
            </label>
            <input
              suppressHydrationWarning
              id="university"
              name="university"
              type="text"
              value={formData.university}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder={t(
                "auth.signup.step2.studentInfo.universityPlaceholder"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="fieldOfStudy"
              className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
            >
              {t("auth.signup.step2.studentInfo.fieldOfStudy")}
            </label>
            <input
              suppressHydrationWarning
              id="fieldOfStudy"
              name="fieldOfStudy"
              type="text"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder={t(
                "auth.signup.step2.studentInfo.fieldOfStudyPlaceholder"
              )}
            />
          </div>
        </div>

        {/* Graduation Year */}
        <div className="mt-4 sm:mt-6">
          <label
            htmlFor="graduationYear"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.studentInfo.graduationYear")}
          </label>
          <input
            suppressHydrationWarning
            id="graduationYear"
            name="graduationYear"
            type="number"
            min="2024"
            max="2030"
            value={formData.graduationYear}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder={t(
              "auth.signup.step2.studentInfo.graduationYearPlaceholder"
            )}
          />
        </div>

        {/* Bio */}
        <div className="mt-4 sm:mt-6">
          <label
            htmlFor="bio"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.studentInfo.bio")}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder={t("auth.signup.step2.studentInfo.bioPlaceholder")}
          />
        </div>

        {/* Skills */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
            {t("auth.signup.step2.studentInfo.skills")}
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
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder={t("auth.signup.step2.studentInfo.addSkill")}
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={addSkill}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              {t("auth.signup.step2.studentInfo.addSkillButton")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 sm:py-2 bg-primary-light text-primary rounded-full text-sm flex items-center gap-1 sm:gap-2 font-medium"
              >
                {skill}
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-primary hover:text-primary-hover text-lg"
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
