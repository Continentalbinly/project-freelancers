"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import GlobalStatus from "../components/GlobalStatus";

/**
 * Protects admin routes — waits for both Auth and Profile to load properly
 * before deciding access. Prevents premature redirects.
 */
export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading: authLoading } = useAuth() as any;
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 🕒 Wait until Firebase Auth fully loads
    if (authLoading || user === undefined) return;

    // 🔒 No user = redirect to login
    if (!user) {
      setChecking(false);
      setIsAuthorized(false);
      router.replace("/auth/login");
      return;
    }

    // ⏳ Wait for profile data (it might load slightly after user)
    if (!profile) return;

    // 📧 Check email verification
    if (!user.emailVerified) {
      setChecking(false);
      setIsAuthorized(false);
      router.replace("/verify-email");
      return;
    }

    // 🧩 Check role
    const isAdmin = profile.isAdmin === true || profile.role === "admin";

    if (isAdmin) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      router.replace("/");
    }

    setChecking(false);
  }, [user, profile, authLoading, router]);

  // 🌀 Show global loading while verifying auth + profile
  if (authLoading || checking || !user || !profile) {
    return (
      <GlobalStatus
        type="loading"
        message="Checking admin access... please wait."
      />
    );
  }

  // ✅ Render page if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // 🚫 Show graceful denied screen (instead of redirect flicker)
  return (
    <GlobalStatus
      type="denied"
      message="You don't have permission to access this admin area."
    />
  );
}
