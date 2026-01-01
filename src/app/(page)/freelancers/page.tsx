"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import PortfolioSection from "./components/PortfolioSection";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import PopularSkillsSection from "./components/PopularSkillsSection";
import CTASection from "./components/CTASection";

export default function FreelancersPage() {
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

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("freelancersPage.hero.title")}
        subtitle={t("freelancersPage.hero.subtitle")}
        primaryCTA={{
          label: t("freelancersPage.hero.startEarning"),
          href: "/auth/signup?type=freelancer",
        }}
        secondaryCTA={{
          label: t("freelancersPage.hero.browseProjects"),
          href: "/projects",
        }}
        className="bg-linear-to-br from-primary via-primary-hover to-primary-hover dark:from-primary/90 dark:via-primary dark:to-primary-hover relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </MarketingHero>

      {/* Modular sections */}
      <PortfolioSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PopularSkillsSection />
      <CTASection />
    </MarketingLayout>
  );
}
