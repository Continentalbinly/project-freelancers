"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useRef, useEffect } from "react";

interface StepProgressProps {
  currentStep: number;
  steps: string[];
}

export default function StepProgress({
  currentStep,
  steps,
}: StepProgressProps) {
  const { t } = useTranslationContext();
  const stepListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for small screens
  useEffect(() => {
    if (window.innerWidth < 640 && stepListRef.current) {
      const active = stepListRef.current.querySelector<HTMLDivElement>(
        `[data-step="${currentStep}"]`
      );
      if (active) {
        active.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [currentStep]);

  return (
    <div className="border-b border-border bg-white rounded-t-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-2xl font-semibold text-text-primary">
          {t("createProject.createNewProject")}
        </h1>
        <span className="text-xs sm:text-sm text-text-secondary whitespace-nowrap">
          {t("createProject.step")} {currentStep} {t("createProject.of")}{" "}
          {steps.length}
        </span>
      </div>

      {/* Steps */}
      <div
        ref={stepListRef}
        className="
          flex items-center justify-between 
          overflow-x-auto sm:overflow-visible 
          gap-4 sm:gap-6 md:gap-8 
          pb-2 sm:pb-0
          -mx-2 sm:mx-0 px-2 sm:px-0
          scrollbar-hide
        "
      >
        {steps.map((title, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={index}
              data-step={stepNum}
              className="flex flex-col items-center flex-shrink-0 min-w-[60px] sm:min-w-0"
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-semibold border-2 transition-all duration-300 cursor-default sm:cursor-pointer 
                ${
                  isCompleted
                    ? "bg-primary border-primary text-white hover:scale-105"
                    : isActive
                    ? "border-primary text-primary bg-white shadow-sm scale-105"
                    : "border-gray-300 text-gray-400 bg-white hover:border-primary/60 hover:text-primary/70"
                }`}
              >
                {isCompleted ? <CheckIcon className="w-4 h-4" /> : stepNum}
              </div>

              {/* Step Label */}
              <p
                className={`text-[10px] sm:text-xs mt-2 text-center w-20 sm:w-24 truncate 
                ${
                  isActive ? "text-primary font-medium" : "text-text-secondary"
                }`}
              >
                {title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
