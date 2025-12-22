"use client";

import { statusSteps, ProjectStatus, getStatusLabel } from "./utils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Check } from "lucide-react";

interface StepperProps {
  current: ProjectStatus;
}

export default function ProjectStepper({ current }: StepperProps) {
  const { currentLanguage } = useTranslationContext();
  const lang = currentLanguage === "lo" ? "lo" : "en";

  const currentIndex = statusSteps.indexOf(current);
  const lastIndex = statusSteps.length - 1;

  return (
    <div className="mb-10 w-full max-w-5xl mx-auto px-2 sm:px-4">
      {/* === STEPS ROW === */}
      <div className="flex justify-between items-start sm:items-center gap-2 sm:gap-0">
        {statusSteps.map((step, index) => {
          const isFinalStep = index === lastIndex;

          const isCompleted =
            index < currentIndex || (index === currentIndex && isFinalStep);

          const isActive = index === currentIndex && !isFinalStep;

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center min-w-[50px]"
            >
              {/* Circle */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border transition-all
                  ${
                    isCompleted
                      ? "bg-primary text-white border-primary"
                      : isActive
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-text-secondary "
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs sm:text-sm">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <p
                className={`text-[10px] sm:text-xs mt-2 text-center leading-tight px-1
                  ${
                    isActive
                      ? "text-primary font-medium"
                      : isCompleted
                      ? "text-primary/70"
                      : "text-text-secondary"
                  }
                `}
              >
                {getStatusLabel(step, lang)}
              </p>
            </div>
          );
        })}
      </div>

      {/* === PROGRESS BAR === */}
      <div className="relative mt-4 h-1 bg-border rounded-full mx-2 sm:mx-4">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / statusSteps.length) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
