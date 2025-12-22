"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  loading: boolean;
  uploading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  isValid,
  loading,
  uploading,
  onPrev,
  onNext,
}: StepNavigationProps) {
  const { t } = useTranslationContext();
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Previous Button */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={onPrev}
          disabled={loading || uploading}
          className="sm:flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {"< "}{t("common.previous") || "Previous"}
        </button>
      )}

      {/* Next/Submit Button */}
      <button
        type="button"
        onClick={isLastStep ? onNext : onNext}
        disabled={!isValid || loading || uploading}
        className="sm:flex-1 px-4 py-3 rounded-lg font-medium text-white bg-linear-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("common.processing") || "Processing..."}
          </>
        ) : isLastStep ? (
          <>
            {t("auth.signup.actions.signup") || "Sign Up"}
          </>
        ) : (
          <>
            {t("common.next") || "Next"}{" >"}
          </>
        )}
      </button>
    </div>
  );
}
