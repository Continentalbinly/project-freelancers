"use client";

import MarketingSection from "@/app/(page)/components/MarketingSection";
import Stagger from "@/app/components/motion/Stagger";
import StaggerItem from "@/app/components/motion/StaggerItem";
import { DollarSign, Briefcase, Users } from "lucide-react";

interface FeaturesSectionProps {
  t: (key: string) => string;
}

export default function FeaturesSection({ t }: FeaturesSectionProps) {
  const features = [
    {
      icon: DollarSign,
      bgClass: "bg-primary/10",
      textClass: "text-primary",
      key: "earnWhileLearn",
    },
    {
      icon: Briefcase,
      bgClass: "bg-secondary/10",
      textClass: "text-secondary",
      key: "buildPortfolio",
    },
    {
      icon: Users,
      bgClass: "bg-success/10",
      textClass: "text-success",
      key: "joinCommunity",
    },
  ];

  return (
    <MarketingSection
      id="features"
      title={t("landingPage.features.title")}
      subtitle={t("landingPage.features.subtitle")}
      background="default"
    >
      <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, bgClass, textClass, key }) => (
          <StaggerItem key={key}>
            <div
              className="group rounded-2xl border border-border bg-background-secondary p-8 sm:p-10
                         hover:border-primary/40 hover:shadow-md
                         transition-[box-shadow,border-color] duration-200 cursor-pointer"
            >
              <div
                className={`w-16 h-16 ${bgClass} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <Icon className={`w-8 h-8 ${textClass}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-text-primary">
                {t(`landingPage.features.${key}.title`)}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t(`landingPage.features.${key}.description`)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </MarketingSection>
  );
}
