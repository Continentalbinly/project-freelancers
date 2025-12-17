/**
 * Role-based route guard utility
 * Use in role-specific pages to redirect unauthorized users
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface RoleGuardOptions {
  requiredRole: "client" | "freelancer" | "admin";
  redirectTo?: string;
}

/**
 * Hook to guard route access by role
 * @param options - Configuration for role guarding
 * @returns authorized flag to show/hide content
 */
export function useRoleGuard(
  options: RoleGuardOptions
): { isAuthorized: boolean; isLoading: boolean } {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !profile) return;
    const role = profile.role;
    const isAdmin = profile.isAdmin === true || role === "admin"; // backward compatible
    const isClient = role === "client";
    const isFreelancer = role === "freelancer";

    let isAuthorized = false;

    if (options.requiredRole === "admin") {
      isAuthorized = isAdmin;
    } else if (options.requiredRole === "client") {
      isAuthorized = isClient || isAdmin;
    } else if (options.requiredRole === "freelancer") {
      isAuthorized = isFreelancer || isAdmin;
    }

    if (!isAuthorized) {
      // Redirect to appropriate page based on user's role
      const redirectTo = options.redirectTo || "/";
      router.push(redirectTo);
    }
  }, [user, profile, loading, options, router]);

  return {
    isAuthorized:
      user && profile
        ? profile.role === options.requiredRole || profile.isAdmin === true || profile.role === "admin"
        : false,
    isLoading: loading,
  };
}
