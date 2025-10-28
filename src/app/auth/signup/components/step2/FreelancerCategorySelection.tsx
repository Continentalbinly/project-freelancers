import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface FreelancerCategorySelectionProps {
  formData: SignupCredentials;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function FreelancerCategorySelection({
  formData,
  handleChange,
}: FreelancerCategorySelectionProps) {
  const { t } = useTranslationContext();

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
          {t("auth.signup.step2.userCategory.title")}
        </h4>

        <div className="space-y-3 sm:space-y-4">
          {/* Student Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.userCategory === "student"
                ? "border-primary bg-primary-light/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="userCategory"
              value="student"
              checked={formData.userCategory === "student"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                </div>
                <span className="text-base sm:text-lg font-semibold text-text-primary">
                  {t("auth.signup.step2.userCategory.student.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.userCategory.student.description")}
              </p>
            </div>
          </label>

          {/* Worker Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.userCategory === "worker"
                ? "border-primary bg-primary-light/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="userCategory"
              value="worker"
              checked={formData.userCategory === "worker"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                </div>
                <span className="text-base sm:text-lg font-semibold text-text-primary">
                  {t("auth.signup.step2.userCategory.worker.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.userCategory.worker.description")}
              </p>
            </div>
          </label>

          {/* Freelancer Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.userCategory === "freelancer"
                ? "border-primary bg-primary-light/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="userCategory"
              value="freelancer"
              checked={formData.userCategory === "freelancer"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                </div>
                <span className="text-base sm:text-lg font-semibold text-text-primary">
                  {t("auth.signup.step2.userCategory.freelancer.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.userCategory.freelancer.description")}
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
