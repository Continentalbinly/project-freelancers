"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { memo, useMemo } from "react";
import {
  Home,
  Folder,
  LogIn,
  PlusSquare,
  User,
  UserRoundCheck,
  ListCheck,
  ShoppingCart,
  LayoutDashboard,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useProposalCount } from "./hooks/useProposalCount";
import { useOrderCount } from "./hooks/useOrderCount";

function MobileNavBar() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  const isFreelancer = useMemo(() => profile?.role === "freelancer", [profile?.role]);
  const isClient = useMemo(() => profile?.role === "client", [profile?.role]);

  // Get order count for active orders needing attention
  const { count: orderCount } = useOrderCount({
    userId: user?.uid || null,
    userRole: isFreelancer ? "freelancer" : isClient ? "client" : null,
  });

  // Get proposal count for pending proposals
  const { count: proposalCount } = useProposalCount({
    userId: user?.uid || null,
    userRole: isFreelancer ? "freelancer" : isClient ? "client" : null,
  });

  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/dashboard")) {
      return true;
    }
    if (href === "/dashboard" && pathname?.startsWith("/dashboard")) {
      return true;
    }
    if (href === "/my-projects" && pathname?.startsWith("/my-projects")) {
      return true;
    }
    return pathname === href;
  };

  const guestLinks = [
    { href: "/", label: t("header.home"), icon: Home },
    { href: "/projects", label: t("header.findWork"), icon: ListCheck },
    { href: "/gigs", label: t("header.hireFreelancer"), icon: UserRoundCheck },
    { href: "/auth/login", label: t("common.signIn"), icon: LogIn },
  ];

  const userLinks = [
    isFreelancer
      ? { href: "/projects", label: t("header.findWork"), icon: Folder }
      : isClient
      ? { href: "/gigs", label: t("header.hireFreelancer"), icon: User }
      : null, // No default link for other roles
    { href: "/my-projects", label: t("header.work") || "My Work", icon: Briefcase },
    { href: "/proposals", label: t("header.proposals"), icon: PlusSquare },
    { href: "/orders", label: t("header.orders"), icon: ShoppingCart },
    { href: "/dashboard", label: t("header.dashboard") || "Dashboard", icon: LayoutDashboard },
  ].filter(Boolean) as Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>;

  const navLinks = user ? userLinks : guestLinks;

  // 🌀 While auth is loading — show loading placeholders
  if (loading) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-sm md:hidden animate-pulse">
        <ul className="flex justify-around items-center h-14">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 bg-background-tertiary rounded-full"></div>
              <div className="w-10 h-2 bg-background-tertiary rounded"></div>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-sm md:hidden">
      <ul className="flex justify-around items-center h-14">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <li key={href} className="relative">
            <Link
              href={href}
              className={`flex flex-col items-center text-xs transition-colors w-full ${
                isActive(href)
                  ? "text-primary font-semibold"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {href === "/orders" && orderCount > 0 && (
                  <span className="absolute -top-1 -right-4 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-error rounded-full">
                    {orderCount > 99 ? "99+" : orderCount}
                  </span>
                )}
                {href === "/proposals" && proposalCount > 0 && (
                  <span className="absolute -top-1 -right-4 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-error rounded-full">
                    {proposalCount > 99 ? "99+" : proposalCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default memo(MobileNavBar);
