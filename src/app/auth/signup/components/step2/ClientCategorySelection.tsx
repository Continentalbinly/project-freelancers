import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ClientCategorySelectionProps {
  formData: SignupCredentials;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function ClientCategorySelection({
  formData,
  handleChange,
}: ClientCategorySelectionProps) {
  const { t } = useTranslationContext();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-secondary-light/10 rounded-xl p-4 sm:p-6 border border-secondary/20">
        <h4 className="font-semibold text-secondary mb-3 sm:mb-4 flex items-center">
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          {t("auth.signup.step2.clientCategory.title")}
        </h4>

        <div className="space-y-3 sm:space-y-4">
          {/* Teacher Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.clientCategory === "teacher"
                ? "border-secondary bg-secondary-light/20"
                : "border-border hover:border-secondary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="clientCategory"
              value="teacher"
              checked={formData.clientCategory === "teacher"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
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
                  {t("auth.signup.step2.clientCategory.teacher.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.clientCategory.teacher.description")}
              </p>
            </div>
          </label>

          {/* Worker Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.clientCategory === "worker"
                ? "border-secondary bg-secondary-light/20"
                : "border-border hover:border-secondary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="clientCategory"
              value="worker"
              checked={formData.clientCategory === "worker"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
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
                  {t("auth.signup.step2.clientCategory.worker.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.clientCategory.worker.description")}
              </p>
            </div>
          </label>

          {/* Freelancer Option */}
          <label
            className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.clientCategory === "freelancer"
                ? "border-secondary bg-secondary-light/20"
                : "border-border hover:border-secondary/50"
            }`}
          >
            <input
              suppressHydrationWarning
              type="radio"
              name="clientCategory"
              value="freelancer"
              checked={formData.clientCategory === "freelancer"}
              onChange={handleChange}
              className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
            />
            <div className="ml-3 sm:ml-4 flex-1">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
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
                  {t("auth.signup.step2.clientCategory.freelancer.title")}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t("auth.signup.step2.clientCategory.freelancer.description")}
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
