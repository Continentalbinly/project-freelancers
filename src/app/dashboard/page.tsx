"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import ClientDashboard from "./components/client";
import FreelancerDashboard from "./components/freelancer";

export default function Dashboard(): React.ReactElement {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  // Determine user role
  const isClient = profile?.userType?.includes("client") || profile?.userRoles?.includes("client");
  const isFreelancer = profile?.userType?.includes("freelancer") || profile?.userRoles?.includes("freelancer");

  // If role is passed as param, use it; otherwise use user's role
  const displayRole = roleParam || (isClient ? "client" : "freelancer");

  // 🔐 Check if user is logged in and authorized
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!profile) return;

    // Check if user has the role they're trying to view
    if (displayRole === "client" && !isClient) {
      router.push("/dashboard?role=freelancer");
      return;
    }

    if (displayRole === "freelancer" && !isFreelancer) {
      router.push("/dashboard?role=client");
      return;
    }
  }, [user, profile, loading, router, displayRole, isClient, isFreelancer]);

  return displayRole === "client" ? <ClientDashboard /> : <FreelancerDashboard />;
}
