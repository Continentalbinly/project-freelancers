"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import FeatureGrid from "../components/FeatureGrid";
import CTA from "../components/CTA";
import {
  Zap,
  BookOpen,
  DollarSign,
  Shield,
  Settings,
  HelpCircle,
  Play,
} from "lucide-react";

export default function HelpPage() {
  const { t } = useTranslationContext();
  const router = useRouter();

  const helpSections = [
    {
      icon: Zap,
      title: t("help.sections.gettingStarted.title"),
      description: t("help.sections.gettingStarted.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
      href: "/help/getting-started",
      linkText: t("help.sections.gettingStarted.link"),
    },
    {
      icon: BookOpen,
      title: t("help.sections.forFreelancers.title"),
      description: t("help.sections.forFreelancers.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      href: "/help/freelancers",
      linkText: t("help.sections.forFreelancers.link"),
    },
    {
      icon: DollarSign,
      title: t("help.sections.forClients.title"),
      description: t("help.sections.forClients.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
      href: "/help/clients",
      linkText: t("help.sections.forClients.link"),
    },
    {
      icon: DollarSign,
      title: t("help.sections.payments.title"),
      description: t("help.sections.payments.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      href: "/help/payments",
      linkText: t("help.sections.payments.link"),
    },
    {
      icon: Shield,
      title: t("help.sections.safety.title"),
      description: t("help.sections.safety.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
      href: "/help/safety",
      linkText: t("help.sections.safety.link"),
    },
    {
      icon: Settings,
      title: t("help.sections.troubleshooting.title"),
      description: t("help.sections.troubleshooting.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      href: "/help/troubleshooting",
      linkText: t("help.sections.troubleshooting.link"),
    },
  ];

  const tutorials = [
    {
      icon: Play,
      title: t("help.videoTutorials.tutorials.gettingStarted.title"),
      description: t("help.videoTutorials.tutorials.gettingStarted.description"),
      duration: t("help.videoTutorials.tutorials.gettingStarted.duration"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Play,
      title: t("help.videoTutorials.tutorials.postProject.title"),
      description: t("help.videoTutorials.tutorials.postProject.description"),
      duration: t("help.videoTutorials.tutorials.postProject.duration"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Play,
      title: t("help.videoTutorials.tutorials.submittingProposals.title"),
      description: t(
        "help.videoTutorials.tutorials.submittingProposals.description"
      ),
      duration: t("help.videoTutorials.tutorials.submittingProposals.duration"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("help.hero.title")}
        subtitle={t("help.hero.subtitle")}
      />

      {/* Quick Help */}
      <MarketingSection>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("help.quickHelp.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("help.quickHelp.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {helpSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={index}
                href={section.href}
                className="rounded-2xl border border-border bg-background-secondary p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div
                  className={`w-12 h-12 ${section.iconBg} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${section.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {section.title}
                </h3>
                <p className="text-base text-text-secondary mb-4 leading-relaxed">
                  {section.description}
                </p>
                <span className="text-primary hover:text-primary-hover font-medium transition-colors duration-200">
                  {section.linkText} →
                </span>
              </Link>
            );
          })}
        </div>
      </MarketingSection>

      {/* Video Tutorials */}
      <MarketingSection background="secondary">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("help.videoTutorials.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("help.videoTutorials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tutorials.map((tutorial, index) => {
            const Icon = tutorial.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-background-secondary overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-video flex items-center justify-center bg-background-tertiary">
                  <div className="text-center">
                    <Icon className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary">
                      {t("help.videoTutorials.comingSoon")}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    {tutorial.description}
                  </p>
                  <span className="text-xs text-text-muted">
                    {tutorial.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </MarketingSection>

      {/* Contact Support */}
      <CTA
        title={t("help.contactSupport.title")}
        subtitle={t("help.contactSupport.subtitle")}
        primaryCTA={{
          label: t("help.contactSupport.contactSupport"),
          href: "/contact",
        }}
        secondaryCTA={{
          label: t("help.contactSupport.viewFaq"),
          href: "/faq",
        }}
        variant="solid"
      />
    </MarketingLayout>
  );
}
