"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { formatEarnings } from "@/service/currencyUtils";
import JsonLd from "@/app/components/seo/JsonLd";

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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoadingStats(true);
        const res = await fetch("/api/stats", {
          signal: abortController.signal,
        });
        const data = await res.json();
        if (data.success && !abortController.signal.aborted) {
          setStats(data.data);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name !== "AbortError") {
          // console.error("Error fetching stats:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://unijobs.app";

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "UniJobs",
    description:
      "Join the largest academic freelancing community where students can earn income while studying.",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/projects?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "UniJobs",
      url: siteUrl,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={jsonLdData} />
      {/* 🏠 Hero */}
      <HeroSection t={t} />

      {/* 🧩 Top Categories */}
      <TopCategories t={t} />

      {/* 🚀 How It Works */}
      <HowItWorksSection t={t} />

      {/* ✨ Features */}
      <FeaturesSection t={t} />

      {/* 👥 User Types */}
      <UserTypesSection t={t} />

      {/* 📈 Stats */}
      <StatsSection
        t={t}
        stats={stats}
        loading={loadingStats}
        formatEarnings={formatEarnings}
      />

      {/* 🎯 Final CTA */}
      <CTASection t={t} />
    </div>
  );
}
