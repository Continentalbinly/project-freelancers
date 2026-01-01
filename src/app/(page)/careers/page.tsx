"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import FeatureGrid from "../components/FeatureGrid";
import CTA from "../components/CTA";
import {
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  BookOpen,
  Users,
  Heart,
  Briefcase,
} from "lucide-react";

export default function CareersPage() {
  const { t } = useTranslationContext();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) return null;

  const whyWorkWithUs = [
    {
      icon: Zap,
      title: t("careers.mission.whyWorkWithUs.innovation.title"),
      description: t("careers.mission.whyWorkWithUs.innovation.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: CheckCircle2,
      title: t("careers.mission.whyWorkWithUs.impact.title"),
      description: t("careers.mission.whyWorkWithUs.impact.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: Clock,
      title: t("careers.mission.whyWorkWithUs.flexibility.title"),
      description: t("careers.mission.whyWorkWithUs.flexibility.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: t("careers.benefits.competitiveSalary.title"),
      description: t("careers.benefits.competitiveSalary.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Home,
      title: t("careers.benefits.remoteFirst.title"),
      description: t("careers.benefits.remoteFirst.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: CheckCircle2,
      title: t("careers.benefits.healthWellness.title"),
      description: t("careers.benefits.healthWellness.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      icon: BookOpen,
      title: t("careers.benefits.learningGrowth.title"),
      description: t("careers.benefits.learningGrowth.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      icon: Users,
      title: t("careers.benefits.teamEvents.title"),
      description: t("careers.benefits.teamEvents.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Clock,
      title: t("careers.benefits.flexiblePto.title"),
      description: t("careers.benefits.flexiblePto.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
  ];

  const culture = [
    {
      icon: Zap,
      title: t("careers.culture.innovation.title"),
      description: t("careers.culture.innovation.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Users,
      title: t("careers.culture.collaboration.title"),
      description: t("careers.culture.collaboration.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: CheckCircle2,
      title: t("careers.culture.impact.title"),
      description: t("careers.culture.impact.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      icon: Heart,
      title: t("careers.culture.diversity.title"),
      description: t("careers.culture.diversity.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
  ];

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("careers.title")}
        subtitle={t("careers.subtitle")}
      />

      {/* Mission Section */}
      <MarketingSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-6">
              {t("careers.mission.title")}
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("careers.mission.paragraph1")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("careers.mission.paragraph2")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              {t("careers.mission.paragraph3")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background-secondary p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              {t("careers.mission.whyWorkWithUs.title")}
            </h3>
            <div className="space-y-6">
              {whyWorkWithUs.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 ${item.iconBg} rounded-full flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">
                        {item.title}
                      </h4>
                      <p className="text-text-secondary">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Open Positions */}
      <MarketingSection background="secondary">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("careers.openPositions.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("careers.openPositions.subtitle")}
          </p>
        </div>

        {/* No Positions Message */}
        <div className="rounded-2xl border border-border bg-background-secondary p-8 sm:p-12 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            {t("careers.openPositions.noPositions.title")}
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            {t("careers.openPositions.noPositions.subtitle")}
          </p>
          <p className="text-base text-text-secondary mb-8 max-w-2xl mx-auto">
            {t("careers.openPositions.noPositions.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-primary text-white hover:bg-primary-hover px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t("careers.openPositions.noPositions.contactUs")}
            </Link>
            <a
              href="mailto:careers@UniJobs.com"
              className="inline-flex items-center justify-center border-2 border-border bg-background text-text-primary hover:bg-background-secondary hover:border-primary/40 px-8 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {t("careers.openPositions.noPositions.sendResume")}
            </a>
          </div>
        </div>
      </MarketingSection>

      {/* Benefits Section */}
      <MarketingSection>
        <FeatureGrid
          title={t("careers.benefits.title")}
          subtitle={t("careers.benefits.subtitle")}
          features={benefits}
          columns={3}
        />
      </MarketingSection>

      {/* Culture Section */}
      <MarketingSection background="secondary">
        <FeatureGrid
          title={t("careers.culture.title")}
          subtitle={t("careers.culture.subtitle")}
          features={culture}
          columns={4}
        />
      </MarketingSection>

      {/* CTA Section */}
      <CTA
        title={t("careers.cta.title")}
        subtitle={t("careers.cta.subtitle")}
        primaryCTA={{
          label: t("careers.cta.contactUs"),
          href: "/contact",
        }}
        secondaryCTA={{
          label: t("careers.cta.sendResume"),
          href: "mailto:careers@UniJobs.com",
        }}
      />
    </MarketingLayout>
  );
}
