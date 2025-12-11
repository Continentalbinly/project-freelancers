"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function PopularSkillsSection() {
  const { t } = useTranslationContext();

  const skills = [
    { icon: "🧠", i: 0 },
    { icon: "🎨", i: 1 },
    { icon: "💻", i: 2 },
    { icon: "📸", i: 3 },
  ];

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("freelancersPage.popularSkills.title")}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
          {t("freelancersPage.popularSkills.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {skills.map((skill) => (
            <div
              key={skill.i}
              className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3">{skill.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t(`freelancersPage.popularSkills.skills.${skill.i}.title`)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t(
                  `freelancersPage.popularSkills.skills.${skill.i}.description`
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
