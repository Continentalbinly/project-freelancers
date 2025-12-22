"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = {
  1: "auth.signup.steps.labels.role",
  2: "auth.signup.steps.labels.account",
  3: "auth.signup.steps.labels.profile",
  4: "auth.signup.steps.labels.review",
} as const;

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useTranslationContext();

  const labels = Array.from({ length: totalSteps }).map((_, i) => {
    const key = STEP_LABELS[(i + 1) as keyof typeof STEP_LABELS];
    return (key ? t(key) : null) || `Step ${i + 1}`;
  });

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>
      {/* Steps */}
      <ol className="flex items-start justify-between relative">
        {/* Center progress line (desktop/tablet) */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-border hidden sm:block" />
        <div
          className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500 hidden sm:block"
          style={{ width: `${progress}%` }}
        />

        {labels.map((label, i) => {
          const isCompleted = i + 1 < currentStep;
          const isCurrent = i + 1 === currentStep;

          return (
            <li key={i} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (mobile below style) */}
              {i < labels.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10 sm:hidden">
                  <div className={`h-full transition-all ${isCompleted ? "bg-primary" : "bg-border"}`} />
                </div>
              )}

              {/* Step circle */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-success text-white shadow-md"
                    : isCurrent
                    ? "bg-linear-to-br from-primary to-secondary text-white shadow-md scale-105 ring-4 ring-primary/20"
                    : "bg-background-secondary border-2 border-border text-text-secondary"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{i + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={`mb-4 mt-3 text-xs sm:text-sm text-center px-2 font-medium transition-all duration-300 ${
                  isCurrent ? "text-primary scale-105" : isCompleted ? "text-text" : "text-text-secondary"
                }`}
              >
                {label}
              </span>

              {/* Current indicator dot */}
              {isCurrent && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile progress bar (compact) */}
      <div className="relative h-2 bg-background-secondary rounded-full overflow-hidden sm:hidden">
        <div
          className="absolute top-0 left-0 h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
