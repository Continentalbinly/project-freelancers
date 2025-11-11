"use client";

import { statusSteps, ProjectStatus, getStatusLabel } from "./utils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Check } from "lucide-react";

interface StepperProps {
  current: ProjectStatus;
}

export default function ProjectStepper({ current }: StepperProps) {
  const { currentLanguage } = useTranslationContext() as any;
  const lang = currentLanguage === "lo" ? "lo" : "en";
  const currentIndex = statusSteps.indexOf(current);

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 py-6">
      {/* 🔹 Steps */}
      <div className="flex justify-between relative z-10">
        {statusSteps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div
              key={step}
              className="flex flex-col items-center text-center flex-1"
            >
              {/* Step Circle */}
              <div
                className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300
                  w-8 h-8 sm:w-10 sm:h-10
                  ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "bg-white border-primary text-primary scale-110 shadow-md"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="font-semibold text-sm sm:text-base">
                    {i + 1}
                  </span>
                )}
                {/* Active glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-pulse bg-primary/10"></div>
                )}
              </div>

              {/* Step label */}
              <span
                className={`mt-2 text-[10px] sm:text-xs md:text-sm font-medium capitalize transition-colors duration-300 ${
                  isActive
                    ? "text-primary"
                    : isCompleted
                    ? "text-primary/70"
                    : "text-gray-400"
                }`}
              >
                {getStatusLabel(step, lang)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
