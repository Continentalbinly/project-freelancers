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
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          {t("freelancersPage.popularSkills.title")}
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-3xl mx-auto">
          {t("freelancersPage.popularSkills.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {skills.map((skill) => (
            <div
              key={skill.i}
              className="bg-white rounded-lg border border-border shadow-sm p-6 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3">{skill.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {t(`freelancersPage.popularSkills.skills.${skill.i}.title`)}
              </h3>
              <p className="text-sm text-text-secondary">
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
