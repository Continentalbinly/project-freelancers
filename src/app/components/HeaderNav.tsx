"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useEffect, useRef, useState, useMemo, memo } from "react";
import { useProposalCount } from "./hooks/useProposalCount";
import { useOrderCount } from "./hooks/useOrderCount";

function HeaderNav({ pathname }: { pathname: string }) {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();

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

  const [openFinance, setOpenFinance] = useState(false);
  const financeRef = useRef<HTMLDivElement>(null);

  const linkClasses = (path: string) => {
    // Handle home path separately - it should only be active on "/"
    const isActiveHome = path === "/" && pathname === "/";
    // Handle dashboard path separately
    const isActiveDashboard =
      path === "/dashboard" && pathname.startsWith("/dashboard");
    // Handle my-projects path (Work)
    const isActiveWork =
      path === "/my-projects" && pathname.startsWith("/my-projects");
    // Handle orders path (including /orders/[id])
    const isActiveOrders =
      path === "/orders" && pathname.startsWith("/orders");
    // Handle other paths
    const isActivePath = pathname === path;
    const isActive = isActiveHome || isActiveDashboard || isActiveWork || isActiveOrders || isActivePath;

    return `text-sm font-medium transition-colors ${
      isActive
        ? "text-primary border-b-2 border-primary"
        : "text-text-primary hover:text-primary"
    }`;
  };

  // 🌀 outside click handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        financeRef.current &&
        !financeRef.current.contains(e.target as Node)
      ) {
        setOpenFinance(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <nav className="flex items-center space-x-8 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-4 bg-background-tertiary rounded-md"
          ></div>
        ))}
      </nav>
    );
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="hidden md:flex items-center space-x-8 relative">
      {user ? (
        <>
          {/* Freelancer: Find Work link */}
          {isFreelancer && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/projects");
              }}
              className={linkClasses("/projects") + " cursor-pointer"}
            >
              {t("header.findWork")}
            </button>
          )}

          {/* Client: Hire Freelancer link */}
          {isClient && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/gigs");
              }}
              className={linkClasses("/gigs") + " cursor-pointer"}
            >
              {t("header.hireFreelancer")}
            </button>
          )}

          {/* Work: My Projects link (for authenticated users) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/my-projects");
            }}
            className={linkClasses("/my-projects") + " cursor-pointer"}
          >
            {t("header.work")}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/proposals");
            }}
            className={`${linkClasses("/proposals")} relative inline-flex flex-col items-center justify-center cursor-pointer`}
          >
            <span className="relative">
              {t("header.proposals")}
              {proposalCount > 0 && (
                <span className="absolute -top-2 -right-5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full">
                  {proposalCount > 99 ? "99+" : proposalCount}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/orders");
            }}
            className={`${linkClasses("/orders")} relative inline-flex flex-col items-center justify-center cursor-pointer`}
          >
            <span className="relative">
              {t("header.orders")}
              {orderCount > 0 && (
                <span className="absolute -top-2 -right-5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full">
                  {orderCount > 99 ? "99+" : orderCount}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/dashboard");
            }}
            className={linkClasses("/dashboard") + " cursor-pointer"}
          >
            {t("header.dashboard") || "Dashboard"}
          </button>
        </>
      ) : (
        <>
          {/* Guest Links */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/");
            }}
            className={linkClasses("/") + " cursor-pointer"}
          >
            {t("header.home")}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/projects");
            }}
            className={linkClasses("/projects") + " cursor-pointer"}
          >
            {t("header.findWork")}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("/gigs");
            }}
            className={linkClasses("/gigs") + " cursor-pointer"}
          >
            {t("header.hireFreelancer")}
          </button>
        </>
      )}

      {/* About (guest only) */}
      {!user && (
        <button
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/about");
          }}
          className={linkClasses("/about") + " cursor-pointer"}
        >
          {t("header.about")}
        </button>
      )}
    </nav>
  );
}

export default memo(HeaderNav);
