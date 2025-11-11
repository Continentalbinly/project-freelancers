"use client";

import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "./components/landing/LandingPage";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import ProjectsPage from "./projects/page";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useTranslationContext();
  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Show user dashboard if authenticated, landing page if not
  return user ? <ProjectsPage /> : <LandingPage />;
}
