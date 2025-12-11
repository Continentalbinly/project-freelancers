"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PortfolioSection from "./components/PortfolioSection";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import PopularSkillsSection from "./components/PopularSkillsSection";
import CTASection from "./components/CTASection";
import Link from "next/link";

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-hover to-primary-hover dark:from-primary/90 dark:via-primary dark:to-primary-hover py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("freelancersPage.hero.title")}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {t("freelancersPage.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=freelancer"
              className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {t("freelancersPage.hero.startEarning")}
            </Link>
            <Link
              href="/projects"
              className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {t("freelancersPage.hero.browseProjects")}
            </Link>
          </div>
        </div>
      </section>

      {/* Modular sections */}
      <PortfolioSection />
      <HowItWorksSection />
      <BenefitsSection />
      <PopularSkillsSection />
      {/* <SuccessStoriesSection /> */}
      <CTASection />
    </div>
  );
}
