"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useEffect, useRef, useState } from "react";

export default function HeaderNav({ pathname }: { pathname: string }) {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  const isFreelancer = profile?.role === "freelancer";
  const isClient = profile?.role === "client";

  const [openFinance, setOpenFinance] = useState(false);
  const financeRef = useRef<HTMLDivElement>(null);

  const linkClasses = (path: string) => {
    const isActiveHome = path === "/" && (pathname === "/" || pathname === "/dashboard");
    const isActivePath = pathname === path;
    const isActive = isActiveHome || isActivePath;
    
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
      <nav className="hidden md:flex items-center space-x-8 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-4 bg-background-tertiary rounded-md"
          ></div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-8 relative">
      {/* Home */}
      <Link href="/" className={linkClasses("/")}>
        {t("header.home")}
      </Link>

      {user ? (
        <>
          <Link href="/proposals" className={linkClasses("/proposals")}>
            {t("header.proposals")}
          </Link>

          {/* Freelancer: Find Work link */}
          {isFreelancer && (
            <Link href="/projects" className={linkClasses("/projects")}>
              {t("header.findWork")}
            </Link>
          )}

          {/* Client: Hire Freelancer link */}
          {isClient && (
            <Link href="/gigs" className={linkClasses("/gigs")}>
              {t("header.hireFreelancer")}
            </Link>
          )}
        </>
      ) : (
        <>
          {/* Guest Links */}
          <Link href="/projects" className={linkClasses("/projects")}>
            {t("header.findWork")}
          </Link>

          <Link href="/gigs" className={linkClasses("/gigs")}>
            {t("header.hireFreelancer")}
          </Link>

          {/* <Link href="/clients" className={linkClasses("/clients")}>
            {t("header.clients")}
          </Link> */}
        </>
      )}

      {/* About (guest only) */}
      {!user && (
        <Link href="/about" className={linkClasses("/about")}>
          {t("header.about")}
        </Link>
      )}
    </nav>
  );
}
