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
  Shield,
  MessageSquare,
  BarChart3,
  Star,
  Clock,
  Users,
} from "lucide-react";

export default function HowItWorksPage() {
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

  const freelancerSteps = [
    {
      icon: Users,
      title: t("howItWorks.forFreelancers.steps.0.title"),
      description: t("howItWorks.forFreelancers.steps.0.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: MessageSquare,
      title: t("howItWorks.forFreelancers.steps.1.title"),
      description: t("howItWorks.forFreelancers.steps.1.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: BarChart3,
      title: t("howItWorks.forFreelancers.steps.2.title"),
      description: t("howItWorks.forFreelancers.steps.2.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  const clientSteps = [
    {
      icon: MessageSquare,
      title: t("howItWorks.forClients.steps.0.title"),
      description: t("howItWorks.forClients.steps.0.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: Users,
      title: t("howItWorks.forClients.steps.1.title"),
      description: t("howItWorks.forClients.steps.1.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Star,
      title: t("howItWorks.forClients.steps.2.title"),
      description: t("howItWorks.forClients.steps.2.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: t("howItWorks.platformFeatures.features.0.title"),
      description: t("howItWorks.platformFeatures.features.0.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: MessageSquare,
      title: t("howItWorks.platformFeatures.features.1.title"),
      description: t("howItWorks.platformFeatures.features.1.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      icon: BarChart3,
      title: t("howItWorks.platformFeatures.features.2.title"),
      description: t("howItWorks.platformFeatures.features.2.description"),
      iconColor: "text-success",
      iconBg: "bg-success/10",
    },
    {
      icon: Star,
      title: t("howItWorks.platformFeatures.features.3.title"),
      description: t("howItWorks.platformFeatures.features.3.description"),
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
    },
    {
      icon: Clock,
      title: t("howItWorks.platformFeatures.features.4.title"),
      description: t("howItWorks.platformFeatures.features.4.description"),
      iconColor: "text-info",
      iconBg: "bg-info/10",
    },
    {
      icon: Users,
      title: t("howItWorks.platformFeatures.features.5.title"),
      description: t("howItWorks.platformFeatures.features.5.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("howItWorks.hero.title")}
        subtitle={t("howItWorks.hero.subtitle")}
        primaryCTA={{
          label: t("howItWorks.cta.joinAsFreelancer"),
          href: "/auth/signup?type=freelancer",
        }}
        secondaryCTA={{
          label: t("howItWorks.cta.joinAsClient"),
          href: "/auth/signup?type=client",
        }}
      />

      {/* For Freelancers Section */}
      <MarketingSection>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("howItWorks.forFreelancers.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("howItWorks.forFreelancers.subtitle")}
          </p>
        </div>
        <FeatureGrid features={freelancerSteps} columns={3} />
      </MarketingSection>

      {/* For Clients Section */}
      <MarketingSection background="secondary">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("howItWorks.forClients.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("howItWorks.forClients.subtitle")}
          </p>
        </div>
        <FeatureGrid features={clientSteps} columns={3} />
      </MarketingSection>

      {/* Platform Features */}
      <MarketingSection>
        <FeatureGrid
          title={t("howItWorks.platformFeatures.title")}
          subtitle={t("howItWorks.platformFeatures.subtitle")}
          features={platformFeatures}
          columns={3}
        />
      </MarketingSection>

      {/* CTA Section */}
      <CTA
        title={t("howItWorks.cta.title")}
        subtitle={t("howItWorks.cta.subtitle")}
        primaryCTA={{
          label: t("howItWorks.cta.joinAsFreelancer"),
          href: "/auth/signup?type=freelancer",
        }}
        secondaryCTA={{
          label: t("howItWorks.cta.joinAsClient"),
          href: "/auth/signup?type=client",
        }}
      />
    </MarketingLayout>
  );
}
