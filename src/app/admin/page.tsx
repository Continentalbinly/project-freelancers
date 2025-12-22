"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import GlobalStatus from "../components/GlobalStatus";

/**
 * Redirects /admin/panel → /admin/panel/[id]
 * Ensures user is authenticated before redirecting.
 */
export default function AdminPanelRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // 🔒 If user exists, go to their specific admin panel
    router.replace(`/admin/panel/${user.uid}`);
  }, [user, loading, router]);

  return (
    <GlobalStatus
      type="loading"
      message="Redirecting to your admin dashboard..."
    />
  );
}
