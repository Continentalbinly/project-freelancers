"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  DollarSign,
  CheckCircle2,
  Zap,
  MessageSquare,
  Heart,
  Users,
} from "lucide-react";

export default function BenefitsSection() {
  const { t } = useTranslationContext();

  const benefits = [
    {
      icon: DollarSign,
      color: "success",
      iconColor: "text-success",
      iconBg: "bg-success/10",
      i: 0,
    },
    {
      icon: CheckCircle2,
      color: "primary",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      i: 1,
    },
    {
      icon: Zap,
      color: "warning",
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      i: 2,
    },
    {
      icon: MessageSquare,
      color: "info",
      iconColor: "text-info",
      iconBg: "bg-info/10",
      i: 3,
    },
    {
      icon: Heart,
      color: "secondary",
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      i: 4,
    },
    {
      icon: Users,
      color: "success",
      iconColor: "text-success",
      iconBg: "bg-success/10",
      i: 5,
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
          {t("freelancersPage.benefits.title")}
        </h2>
        <p className="text-lg text-text-secondary mb-12 max-w-3xl mx-auto">
          {t("freelancersPage.benefits.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-background-secondary shadow-sm p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 ${b.iconBg} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${b.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`freelancersPage.benefits.features.${b.i}.title`)}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t(`freelancersPage.benefits.features.${b.i}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
