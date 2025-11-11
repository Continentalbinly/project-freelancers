"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function HeaderNav({ pathname }: { pathname: string }) {
  const { user, loading } = useAuth();
  const { t } = useTranslationContext();

  const linkClasses = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? "text-primary border-b-2 border-primary"
        : "text-text-primary hover:text-primary"
    }`;

  // 🌀 While auth is loading — show skeleton shimmer
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
    <nav className="hidden md:flex items-center space-x-8">
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
          <Link href="/transactions" className={linkClasses("/transactions")}>
            {t("header.transactions")}
          </Link>
        </>
      ) : (
        <>
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

      {user ? (
        <Link href="/withdraw" className={linkClasses("/withdraw")}>
          {t("header.withdraw")}
        </Link>
      ) : (
        <Link href="/about" className={linkClasses("/about")}>
          {t("header.about")}
        </Link>
      )}
    </nav>
  );
}
