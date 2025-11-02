"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Folder,
  MessageCircle,
  User,
  PlusSquare,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function MobileNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslationContext();

  // highlight helper
  const isActive = (href: string) => pathname === href;

  const guestLinks = [
    { href: "/", label: t("header.home"), icon: Home },
    { href: "/projects", label: t("header.projects"), icon: Folder },
    { href: "/auth/login", label: t("common.signIn"), icon: LogIn },
  ];

  const userLinks = [
    { href: "/", label: t("header.home"), icon: Home },
    { href: "/dashboard", label: t("header.dashboard"), icon: LayoutDashboard },
    { href: "/proposals", label: t("header.proposals"), icon: PlusSquare },
    { href: "/messages", label: t("header.messages"), icon: MessageCircle },
    { href: "/profile", label: t("header.profile"), icon: User },
  ];

  const navLinks = user ? userLinks : guestLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-sm md:hidden">
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
