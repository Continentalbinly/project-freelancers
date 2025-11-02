"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

// 🧩 Modular Components
import RecentProjects from "./components/RecentProjects";
import ProfileSummary from "./components/Sidebar/ProfileSummary";
import RecentActivity from "./components/Sidebar/RecentActivity";
import QuickTips from "./components/Sidebar/QuickTips";

export default function UserHomePage() {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 text-text-secondary">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{t("common.unauthorized")}</p>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        {/* <SearchSection /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <RecentProjects user={user} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileSummary user={user} profile={profile} />
            <RecentActivity user={user} />
            <QuickTips profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
