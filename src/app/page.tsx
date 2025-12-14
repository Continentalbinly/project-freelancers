"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LandingPage from "./components/landing/LandingPage";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function Home(): React.ReactElement {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [showTimeout, setShowTimeout] = useState(false);

  // 🔐 Role-based redirect for logged-in users
  useEffect(() => {
    if (loading) return; // Still checking auth state
    
    if (!user) {
      // Reset redirect flag when user logs out
      hasRedirected.current = false;
      setShowTimeout(false);
      return; // Not logged in, show landing page
    }
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // Wait for profile with timeout
    if (!profile) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
        // Force redirect after 4 seconds even without profile
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.push("/dashboard");
        }
      }, 4000);
      
      return () => clearTimeout(timer);
    }

    // User and profile both ready - redirect based on role
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      
      const roles = profile?.userRoles || [];
      const types = profile?.userType || [];

      const isClient = roles.includes("client") || types.includes("client");
      const isFreelancer = roles.includes("freelancer") || types.includes("freelancer");

      // 🎯 Route based on primary role
      if (isClient) {
        router.push("/dashboard?role=client");
      } else if (isFreelancer) {
        router.push("/dashboard?role=freelancer");
      } else {
        // User has no role yet, go to generic dashboard
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

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

  // User is logged in but profile still loading - show loading state
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If we reach here, redirect is happening (return loading while redirect completes)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    </div>
  );
}
