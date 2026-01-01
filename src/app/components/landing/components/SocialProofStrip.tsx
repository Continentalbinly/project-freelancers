"use client";

import Reveal from "@/app/components/motion/Reveal";
import { formatEarnings } from "@/service/currencyUtils";
import MarketingContainer from "@/app/(page)/components/MarketingContainer";

interface SocialProofStripProps {
  stats: {
    freelancers: number;
    clients: number;
    projects: number;
    totalEarned: number;
  };
  loading: boolean;
  formatEarnings: (amount: number) => string;
  t: (key: string) => string;
}

export default function SocialProofStrip({
  stats,
  loading,
  formatEarnings,
  t,
}: SocialProofStripProps) {
  if (loading) {
    return (
      <div className="bg-background-secondary border-y border-border/60">
        <MarketingContainer>
          <div className="flex items-center justify-center gap-8 md:gap-12 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 animate-pulse"
              >
                <div className="h-6 w-16 bg-background-tertiary rounded"></div>
                <div className="h-4 w-20 bg-background-tertiary rounded"></div>
              </div>
            ))}
          </div>
        </MarketingContainer>
      </div>
    );
  }

  return (
    <Reveal once={false}>
      <div className="bg-background-secondary border-y border-border/60">
        <MarketingContainer>
          <div className="flex items-center justify-center gap-8 md:gap-12 py-4 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg md:text-xl font-bold text-text-primary">
                {stats.projects.toLocaleString()}+
              </span>
              <span className="text-xs md:text-sm text-text-secondary">
                {t("landingPage.stats.projects")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg md:text-xl font-bold text-text-primary">
                {stats.freelancers.toLocaleString()}+
              </span>
              <span className="text-xs md:text-sm text-text-secondary">
                {t("landingPage.stats.freelancers")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg md:text-xl font-bold text-text-primary">
                {formatEarnings(stats.totalEarned)}
              </span>
              <span className="text-xs md:text-sm text-text-secondary">
                {t("landingPage.stats.earned")}
              </span>
            </div>
          </div>
        </MarketingContainer>
      </div>
    </Reveal>
  );
}
