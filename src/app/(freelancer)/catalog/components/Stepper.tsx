"use client";

import { Check } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function Stepper({
  steps,
  current,
  progressPosition = "below",
}: {
  steps: string[];
  current: number;
  progressPosition?: "below" | "center";
}) {
  const { t } = useTranslationContext();
  const progress = ((current + 1) / steps.length) * 100;

  // Map step names to translation keys
  const stepTranslationMap: Record<string, string> = {
    "Basics": "stepper.basics",
    "Category & Tags": "stepper.categoryTags",
    "Media": "stepper.media",
    "Package": "stepper.package",
  };

  return (
    <div className="mb-8">
      {/* Steps */}
      <ol className="mb-6 flex items-start justify-between relative">
        {progressPosition === "center" && (
          <>
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />
            <div
              className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </>
        )}
        {steps.map((label, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;

          return (
            <li
              key={label}
              className="flex-1 flex flex-col items-center relative group"
            >
              {/* Connector line (hidden on last step) */}
              {progressPosition === "below" && i < steps.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10 hidden sm:block">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  />
                </div>
              )}

              {/* Step circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-100"
                    : isCurrent
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-110 ring-4 ring-primary/20"
                    : "bg-background-secondary border-2 border-border text-text-secondary scale-90"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                ) : (
                  <span className="text-sm font-semibold">{i + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={`mb-4 mt-3 text-xs sm:text-sm text-center px-2 font-medium transition-all duration-300 ${
                  isCurrent
                    ? "text-primary scale-105"
                    : isCompleted
                    ? "text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {(stepTranslationMap[label] ? t(stepTranslationMap[label]) : null) || label}
              </span>

              {/* Current indicator dot */}
              {isCurrent && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </li>
          );
        })}
      </ol>
      {progressPosition === "below" && (
        <div className="relative h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
      )}
    </div>
  );
}
