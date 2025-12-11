import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Step3TermsProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
}

export default function Step3Terms({ formData, setFormData }: Step3TermsProps) {
  const { t } = useTranslationContext();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold   mb-2">
          {t("auth.signup.step3.title")}
        </h3>
        <p className="text-text-secondary">{t("auth.signup.step3.subtitle")}</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 border border-border rounded-xl shadow-sm bg-background">
          <input
            suppressHydrationWarning
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={handleCheckboxChange}
            className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border bg-background rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-text-secondary">
            {t("auth.signup.step3.termsOfService.label")
              .split("Terms of Service")
              .map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <Link
                      href="/terms"
                      className="text-primary hover:text-primary-hover font-medium"
                    >
                      {t("auth.signup.step3.termsOfService.link")}
                    </Link>
                  )}
                </span>
              ))}
          </label>
        </div>

        <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 border border-border rounded-xl shadow-sm bg-background">
          <input
            suppressHydrationWarning
            id="acceptPrivacyPolicy"
            name="acceptPrivacyPolicy"
            type="checkbox"
            required
            checked={formData.acceptPrivacyPolicy}
            onChange={handleCheckboxChange}
            className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border bg-background rounded"
          />
          <label
            htmlFor="acceptPrivacyPolicy"
            className="text-sm text-text-secondary"
          >
            {t("auth.signup.step3.privacyPolicy.label")
              .split("Privacy Policy")
              .map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <Link
                      href="/privacy"
                      className="text-primary hover:text-primary-hover font-medium"
                    >
                      {t("auth.signup.step3.privacyPolicy.link")}
                    </Link>
                  )}
                </span>
              ))}
          </label>
        </div>

        <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 border border-border rounded-xl shadow-sm bg-background">
          <input
            suppressHydrationWarning
            id="acceptMarketingEmails"
            name="acceptMarketingEmails"
            type="checkbox"
            checked={formData.acceptMarketingEmails}
            onChange={handleCheckboxChange}
            className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border bg-background rounded"
          />
          <label
            htmlFor="acceptMarketingEmails"
            className="text-sm text-text-secondary"
          >
            {t("auth.signup.step3.marketingEmails.label")}
          </label>
        </div>
      </div>
    </div>
  );
}
