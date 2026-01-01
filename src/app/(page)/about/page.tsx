"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useEffect, useState } from "react";
import { formatEarnings } from "@/service/currencyUtils";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import FeatureGrid from "../components/FeatureGrid";
import CTA from "../components/CTA";
import {
  CheckCircle2,
  Users,
  Shield,
  TrendingUp,
  Award,
  Heart,
} from "lucide-react";

interface ImpactStats {
  freelancers: number;
  clients: number;
  projects: number;
  totalEarned: number;
  completedProjects: number;
  activeProjects: number;
  totalBudget: number;
}

export default function AboutPage() {
  const { t } = useTranslationContext();
  const [impactStats, setImpactStats] = useState<ImpactStats>({
    freelancers: 0,
    clients: 0,
    projects: 0,
    totalEarned: 0,
    completedProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        setLoadingStats(true);
        const response = await fetch("/api/stats");
        const data = await response.json();

        if (data.success) {
          setImpactStats(data.data);
        }
      } catch {
        // Error handling
      } finally {
        setLoadingStats(false);
      }
    };

    fetchImpactStats();
  }, []);

  const values = [
    {
      icon: CheckCircle2,
      title: t("aboutPage.mission.values.quality.title"),
      description: t("aboutPage.mission.values.quality.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Users,
      title: t("aboutPage.mission.values.community.title"),
      description: t("aboutPage.mission.values.community.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: Shield,
      title: t("aboutPage.mission.values.trust.title"),
      description: t("aboutPage.mission.values.trust.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("aboutPage.title")}
        subtitle={t("aboutPage.subtitle")}
        primaryCTA={{
          label: t("aboutPage.cta.joinAsFreelancer"),
          href: "/auth/signup?type=freelancer",
        }}
        secondaryCTA={{
          label: t("aboutPage.cta.joinAsClient"),
          href: "/auth/signup?type=client",
        }}
      />

      {/* Mission Section */}
      <MarketingSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-6">
              {t("aboutPage.mission.title")}
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("aboutPage.mission.paragraph1")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("aboutPage.mission.paragraph2")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              {t("aboutPage.mission.paragraph3")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background-secondary p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              {t("aboutPage.mission.values.title")}
            </h3>
            <div className="space-y-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 ${value.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${value.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">{value.title}</h4>
                      <p className="text-text-secondary">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Stats Section */}
      <MarketingSection background="secondary">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("aboutPage.impact.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("aboutPage.impact.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              {loadingStats ? (
                <div className="animate-pulse bg-background-tertiary h-8 w-16 mx-auto rounded" />
              ) : (
                `${impactStats.freelancers}+`
              )}
            </div>
            <div className="text-text-secondary">
              {t("aboutPage.impact.freelancers")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
              {loadingStats ? (
                <div className="animate-pulse bg-background-tertiary h-8 w-16 mx-auto rounded" />
              ) : (
                `${impactStats.clients}+`
              )}
            </div>
            <div className="text-text-secondary">
              {t("aboutPage.impact.clients")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-success mb-2">
              {loadingStats ? (
                <div className="animate-pulse bg-background-tertiary h-8 w-16 mx-auto rounded" />
              ) : (
                `${impactStats.projects}+`
              )}
            </div>
            <div className="text-text-secondary">
              {t("aboutPage.impact.projects")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-warning mb-2">
              {loadingStats ? (
                <div className="animate-pulse bg-background-tertiary h-8 w-16 mx-auto rounded" />
              ) : (
                formatEarnings(impactStats.totalEarned)
              )}
            </div>
            <div className="text-text-secondary">
              {t("aboutPage.impact.earned")}
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Team Section */}
      <MarketingSection>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("aboutPage.team.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("aboutPage.team.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 - Anousone */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 text-center hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {t("aboutPage.team.members.anousone.name")}
            </h3>
            <p className="text-secondary font-medium mb-2">
              {t("aboutPage.team.members.anousone.role")}
            </p>
            <p className="text-text-secondary text-sm">
              {t("aboutPage.team.members.anousone.description")}
            </p>
          </div>

          {/* Team Member 2 - Thipphasone */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 text-center hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {t("aboutPage.team.members.thipphasone.name")}
            </h3>
            <p className="text-secondary font-medium mb-2">
              {t("aboutPage.team.members.thipphasone.role")}
            </p>
            <p className="text-text-secondary text-sm">
              {t("aboutPage.team.members.thipphasone.description")}
            </p>
          </div>

          {/* Team Member 3 - Thidaphone */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 text-center hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {t("aboutPage.team.members.thidaphone.name")}
            </h3>
            <p className="text-secondary font-medium mb-2">
              {t("aboutPage.team.members.thidaphone.role")}
            </p>
            <p className="text-text-secondary text-sm">
              {t("aboutPage.team.members.thidaphone.description")}
            </p>
          </div>
        </div>
      </MarketingSection>

      {/* Story Section */}
      <MarketingSection background="secondary">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-6">
              {t("aboutPage.story.title")}
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("aboutPage.story.paragraph1")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed mb-6">
              {t("aboutPage.story.paragraph2")}
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              {t("aboutPage.story.paragraph3")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background-secondary p-8">
            <h3 className="text-2xl font-bold text-text-primary mb-6">
              {t("aboutPage.story.beliefs.title")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                <p className="text-text-secondary">
                  {t("aboutPage.story.beliefs.belief1")}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0" />
                <p className="text-text-secondary">
                  {t("aboutPage.story.beliefs.belief2")}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2 shrink-0" />
                <p className="text-text-secondary">
                  {t("aboutPage.story.beliefs.belief3")}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 shrink-0" />
                <p className="text-text-secondary">
                  {t("aboutPage.story.beliefs.belief4")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* CTA Section */}
      <CTA
        title={t("aboutPage.cta.title")}
        subtitle={t("aboutPage.cta.subtitle")}
        primaryCTA={{
          label: t("aboutPage.cta.joinAsFreelancer"),
          href: "/auth/signup?type=freelancer",
        }}
        secondaryCTA={{
          label: t("aboutPage.cta.joinAsClient"),
          href: "/auth/signup?type=client",
        }}
      />
    </MarketingLayout>
  );
}
