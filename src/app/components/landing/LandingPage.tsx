"use client";
import { useEffect, useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { formatEarnings } from "@/service/currencyUtils";

import HeroSection from "./components/HeroSection";
import TopCategories from "./components/TopCategories";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import UserTypesSection from "./components/UserTypesSection";
import StatsSection from "./components/StatsSection";
import CTASection from "./components/CTASection";

interface PlatformStats {
  freelancers: number;
  clients: number;
  projects: number;
  totalEarned: number;
}

export default function LandingPage() {
  const { t } = useTranslationContext();
  const [stats, setStats] = useState<PlatformStats>({
    freelancers: 0,
    clients: 0,
    projects: 0,
    totalEarned: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch  {
        //console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* 🏠 Hero */}
      <HeroSection t={t} />

      {/* 🧩 Top Categories (new section right under hero) */}
      <TopCategories t={t} />

      {/* 🚀 Rest of landing */}
      <HowItWorksSection t={t} />
      <FeaturesSection t={t} />
      <UserTypesSection t={t} />
      <StatsSection
        t={t}
        stats={stats}
        loading={loadingStats}
        formatEarnings={formatEarnings}
      />
      <CTASection t={t} />
    </div>
  );
}
