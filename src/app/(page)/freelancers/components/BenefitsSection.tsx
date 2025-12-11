"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function BenefitsSection() {
  const { t } = useTranslationContext();

  const benefits = [
    { color: "success", icon: "💵", i: 0 },
    { color: "primary", icon: "✅", i: 1 },
    { color: "warning", icon: "⚡", i: 2 },
    { color: "info", icon: "💬", i: 3 },
    { color: "secondary", icon: "❤️", i: 4 },
    { color: "success", icon: "👥", i: 5 },
  ];

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("freelancersPage.benefits.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          {t("freelancersPage.benefits.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <div className={`text-4xl mb-3`} aria-label={b.icon}>
                {b.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t(`freelancersPage.benefits.features.${b.i}.title`)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t(`freelancersPage.benefits.features.${b.i}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
