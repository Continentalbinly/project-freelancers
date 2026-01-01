"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Brain, Palette, Code, Camera } from "lucide-react";

export default function PopularSkillsSection() {
  const { t } = useTranslationContext();

  const skills = [
    {
      icon: Brain,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      i: 0,
    },
    {
      icon: Palette,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      i: 1,
    },
    {
      icon: Code,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      i: 2,
    },
    {
      icon: Camera,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      i: 3,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
          {t("freelancersPage.popularSkills.title")}
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-3xl mx-auto">
          {t("freelancersPage.popularSkills.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.i}
                className="rounded-2xl border border-border bg-background-secondary shadow-sm p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-16 h-16 ${skill.iconBg} rounded-lg flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-8 h-8 ${skill.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  {t(`freelancersPage.popularSkills.skills.${skill.i}.title`)}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t(
                    `freelancersPage.popularSkills.skills.${skill.i}.description`
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
