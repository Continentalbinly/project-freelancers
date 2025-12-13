"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Folder,
  LogIn,
  Backpack,
  PlusSquare,
  ArrowLeftRight,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function MobileNavBar() {
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  const isFreelancer = profile?.userType?.includes("freelancer");
  const isClient = profile?.userType?.includes("client");

  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname === "/dashboard")) {
      return true;
    }
    return pathname === href;
  };

  const guestLinks = [
    { href: "/", label: t("header.home"), icon: Home },
    { href: "/projects", label: t("header.projects"), icon: Folder },
    { href: "/auth/login", label: t("common.signIn"), icon: LogIn },
  ];

  const userLinks = [
    { href: "/", label: t("header.home"), icon: Home },
    { href: "/proposals", label: t("header.proposals"), icon: PlusSquare },
    // Role-based 4th link
    isFreelancer
      ? { href: "/projects", label: t("header.findWork"), icon: Folder }
      : isClient
      ? { href: "/gigs", label: t("header.hireFreelancer"), icon: User }
      : { href: "/transactions", label: t("header.transactions"), icon: ArrowLeftRight },
    { href: "/profile", label: t("header.profile"), icon: User },
  ];

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
          <li key={href}>
            <Link
              href={href}
              className={`flex flex-col items-center text-xs transition-colors ${
                isActive(href)
                  ? "text-primary font-semibold"
                  : "text-text-secondary hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
