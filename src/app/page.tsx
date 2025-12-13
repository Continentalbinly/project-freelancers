"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LandingPage from "./components/landing/LandingPage";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function Home(): React.ReactElement {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();

  // 🔐 Role-based redirect for logged-in users
  useEffect(() => {
    if (loading || !user || !profile) return;

    const roles = profile?.userRoles || [];
    const types = profile?.userType || [];

    const isClient = roles.includes("client") || types.includes("client");
    const isFreelancer = roles.includes("freelancer") || types.includes("freelancer");

    // 🎯 Route based on primary role
    if (isClient) {
      router.push("/dashboard?role=client");
    } else if (isFreelancer) {
      router.push("/dashboard?role=freelancer");
    }
  }, [user, profile, loading, router]);

  // 🔄 If we have a user but no profile yet, try to refresh it
  useEffect(() => {
    if (!loading && user && !profile) {
      refreshProfile();

      // Fallback: gently push to dashboard if profile never arrives
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, refreshProfile, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Show landing page only if NOT logged in
  if (!user) {
    return <LandingPage />;
  }

  // Fallback loading state when user exists but profile is still resolving
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    </div>
  );
}
