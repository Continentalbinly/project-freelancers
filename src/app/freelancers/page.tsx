"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import PortfolioSection from "./components/PortfolioSection";
import HowItWorksSection from "./components/HowItWorksSection";
import BenefitsSection from "./components/BenefitsSection";
import PopularSkillsSection from "./components/PopularSkillsSection";
import SuccessStoriesSection from "./components/SuccessStoriesSection";
import CTASection from "./components/CTASection";
import Link from "next/link";

export default function FreelancersPage() {
  const { t } = useTranslationContext();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-primary py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("freelancersPage.hero.title")}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            {t("freelancersPage.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=freelancer"
              className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
            >
              {t("freelancersPage.hero.startEarning")}
            </Link>
            <Link
              href="/projects"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
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
