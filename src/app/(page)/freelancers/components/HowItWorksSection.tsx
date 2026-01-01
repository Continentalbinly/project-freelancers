"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { User, Search, DollarSign } from "lucide-react";

export default function HowItWorksSection() {
  const { t } = useTranslationContext();

  const steps = [
    {
      icon: User,
      title: t("freelancersPage.howItWorks.steps.0.title"),
      desc: t("freelancersPage.howItWorks.steps.0.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Search,
      title: t("freelancersPage.howItWorks.steps.1.title"),
      desc: t("freelancersPage.howItWorks.steps.1.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: DollarSign,
      title: t("freelancersPage.howItWorks.steps.2.title"),
      desc: t("freelancersPage.howItWorks.steps.2.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
          {t("freelancersPage.howItWorks.title")}
        </h2>
        <p className="text-lg text-text-secondary mb-12 max-w-3xl mx-auto">
          {t("freelancersPage.howItWorks.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background-secondary p-6 sm:p-8 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-16 h-16 ${step.iconBg} rounded-lg flex items-center justify-center mx-auto mb-6`}
                >
                  <Icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
