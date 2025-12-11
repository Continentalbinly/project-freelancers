import { useTranslationContext } from "@/app/components/LanguageProvider";

interface NavigationButtonsProps {
  currentStep: number;
  isStepValid: boolean;
  loading: boolean;
  uploading: boolean;
  prevStep: () => void;
  nextStep: () => void;
}

export default function NavigationButtons({
  currentStep,
  isStepValid,
  loading,
  uploading,
  prevStep,
  nextStep,
}: NavigationButtonsProps) {
  const { t } = useTranslationContext();

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 sm:pt-8">
      {currentStep > 1 && (
        <button
          suppressHydrationWarning
          type="button"
          onClick={prevStep}
          className="btn btn-outline px-6 sm:px-8 py-2 sm:py-3 order-2 sm:order-1 border border-border text-text-primary"
        >
          {t("auth.signup.navigation.previous")}
        </button>
      )}

      {currentStep < 3 ? (
        <button
          suppressHydrationWarning
          type="button"
          onClick={nextStep}
          disabled={!isStepValid}
          className="btn btn-primary px-6 sm:px-8 py-2 sm:py-3 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("auth.signup.navigation.next")}
        </button>
      ) : (
        <button
          suppressHydrationWarning
          type="submit"
          disabled={loading || uploading || !isStepValid}
          className="btn btn-primary px-6 sm:px-8 py-2 sm:py-3 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? t("auth.signup.step1.uploading")
            : loading
            ? t("auth.signup.navigation.creatingAccount")
            : t("auth.signup.navigation.createAccount")}
        </button>
      )}
    </div>
  );
}
