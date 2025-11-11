"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useDashboardData } from "./hooks/useDashboardData";

import DashboardHeader from "./components/DashboardHeader";
import DashboardStatsGrid from "./components/DashboardStatsGrid";
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import QuickStats from "./components/QuickStats";
import TipsAndResources from "./components/TipsAndResources";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const { t, currentLanguage } = useTranslationContext();
  const { stats, recentActivity, loadingActivity } = useDashboardData(
    user,
    profile,
    t
  );

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader profile={profile} user={user} t={t} />
        <DashboardStatsGrid stats={stats} profile={profile} t={t} />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          <div className="xl:col-span-2 space-y-8">
            <QuickActions profile={profile} t={t} />
            <RecentActivity
              recentActivity={recentActivity}
              loadingActivity={loadingActivity}
              t={t}
              currentLanguage={currentLanguage}
            />
          </div>
          <div className="space-y-6">
            <QuickStats profile={profile} stats={stats} t={t} />
            <TipsAndResources t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
