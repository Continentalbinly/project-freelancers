"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function HowItWorksSection() {
  const { t } = useTranslationContext();

  const steps = [
    {
      icon: "👤",
      title: t("freelancersPage.howItWorks.steps.0.title"),
      desc: t("freelancersPage.howItWorks.steps.0.description"),
    },
    {
      icon: "🔍",
      title: t("freelancersPage.howItWorks.steps.1.title"),
      desc: t("freelancersPage.howItWorks.steps.1.description"),
    },
    {
      icon: "💰",
      title: t("freelancersPage.howItWorks.steps.2.title"),
      desc: t("freelancersPage.howItWorks.steps.2.description"),
    },
  ];

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("freelancersPage.howItWorks.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          {t("freelancersPage.howItWorks.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
