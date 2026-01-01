"use client";

import MarketingSection from "@/app/(page)/components/MarketingSection";
import Stagger from "@/app/components/motion/Stagger";
import StaggerItem from "@/app/components/motion/StaggerItem";

interface HowItWorksSectionProps {
  t: (key: string) => string;
}

export default function HowItWorksSection({ t }: HowItWorksSectionProps) {
  const steps = [
    { bgClass: "bg-primary", ringClass: "ring-primary/10", num: 1, title: "step1" },
    { bgClass: "bg-secondary", ringClass: "ring-secondary/10", num: 2, title: "step2" },
    { bgClass: "bg-success", ringClass: "ring-success/10", num: 3, title: "step3" },
  ];

  return (
    <MarketingSection
      id="how-it-works"
      title={t("landingPage.howItWorks.title")}
      subtitle={t("landingPage.howItWorks.subtitle")}
      background="secondary"
    >
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map(({ bgClass, ringClass, num, title }, idx) => (
          <StaggerItem key={num}>
            <div className="flex flex-col items-center text-center relative">
              {/* Animated connection line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-20 top-10 w-40 h-0.5 bg-linear-to-r from-gray-300 via-gray-300/50 to-transparent"></div>
              )}

              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 ${bgClass} rounded-full flex items-center justify-center mx-auto mb-6 
                           shadow-lg ring-4 ${ringClass}`}
              >
                <span className="text-white font-bold text-xl sm:text-2xl">
                  {num}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">
                {t(`landingPage.howItWorks.${title}.title`)}
              </h3>
              <p className="text-text-secondary">
                {t(`landingPage.howItWorks.${title}.description`)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </MarketingSection>
  );
}
