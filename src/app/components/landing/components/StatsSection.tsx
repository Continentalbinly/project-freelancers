"use client";

import MarketingSection from "@/app/(page)/components/MarketingSection";
import Stagger from "@/app/components/motion/Stagger";
import StaggerItem from "@/app/components/motion/StaggerItem";

interface StatsSectionProps {
  t: (key: string) => string;
  stats: {
    freelancers: number;
    clients: number;
    projects: number;
    totalEarned: number;
  };
  loading: boolean;
  formatEarnings: (amount: number) => string;
}

export default function StatsSection({
  t,
  stats,
  loading,
  formatEarnings,
}: StatsSectionProps) {
  const items = [
    { key: "freelancers", color: "text-primary", value: `${stats.freelancers}+` },
    { key: "clients", color: "text-secondary", value: `${stats.clients}+` },
    { key: "projects", color: "text-success", value: `${stats.projects}+` },
    {
      key: "earned",
      color: "text-warning",
      value: formatEarnings(stats.totalEarned),
    },
  ];

  return (
    <MarketingSection
      id="stats"
      title={t("landingPage.stats.title")}
      subtitle={t("landingPage.stats.subtitle")}
      background="secondary"
    >
      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-2.5">
        {items.map(({ key, color, value }) => (
          <StaggerItem key={key}>
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl font-bold ${color} mb-2`}>
                {loading ? (
                  <div className="animate-pulse bg-background-tertiary h-8 w-16 mx-auto rounded" />
                ) : (
                  value
                )}
              </div>
              <div className="text-text-secondary">
                {t(`landingPage.stats.${key}`)}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </MarketingSection>
  );
}
