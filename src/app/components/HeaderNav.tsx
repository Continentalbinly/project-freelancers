"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useEffect, useRef, useState } from "react";

export default function HeaderNav({ pathname }: { pathname: string }) {
  const { user, loading } = useAuth();
  const { t } = useTranslationContext();

  const [openFinance, setOpenFinance] = useState(false);
  const financeRef = useRef<HTMLDivElement>(null);

  const linkClasses = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? "text-primary border-b-2 border-primary"
        : "text-text-primary hover:text-primary"
    }`;

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
          <Link href="/my-projects" className={linkClasses("/my-projects")}>
            {t("header.myProjects")}
          </Link>
          <Link href="/proposals" className={linkClasses("/proposals")}>
            {t("header.proposals")}
          </Link>

          {/* ----- FINANCE DROPDOWN (CLICK TO OPEN) ----- */}
          <div className="relative" ref={financeRef}>
            <button
              onClick={() => setOpenFinance((prev) => !prev)}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                pathname.startsWith("/transactions") ||
                pathname.startsWith("/topup") ||
                pathname.startsWith("/withdraw") ||
                pathname.startsWith("/subscription")
                  ? "text-primary border-b-2 border-primary cursor-pointer"
                  : "text-text-primary hover:text-primary cursor-pointer"
              }`}
            >
              {t("header.finance") || "Finance"}
              <svg
                className={`w-4 h-4 transition-transform ${
                  openFinance ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* DROPDOWN */}
            {openFinance && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-border rounded-md shadow-lg py-2 z-50">
                <Link
                  href="/transactions"
                  onClick={() => setOpenFinance(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {t("header.transactions")}
                </Link>

                <Link
                  href="/topup"
                  onClick={() => setOpenFinance(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {t("header.topUp")}
                </Link>

                <Link
                  href="/withdraw"
                  onClick={() => setOpenFinance(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {t("header.withdraw")}
                </Link>

                <Link
                  href="/pricing"
                  onClick={() => setOpenFinance(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {t("header.subscription") || "Subscription"}
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Guest Links */}
          <Link href="/projects" className={linkClasses("/projects")}>
            {t("header.projects")}
          </Link>

          <Link href="/freelancers" className={linkClasses("/freelancers")}>
            {t("header.freelancers")}
          </Link>

          <Link href="/clients" className={linkClasses("/clients")}>
            {t("header.clients")}
          </Link>
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
