"use client";
import Link from "next/link";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useAuth } from "@/contexts/AuthContext";
import { formatLAK } from "@/service/currencyUtils";
import LanguageSwitcher from "./LanguageSwitcher";

export default function HeaderUserMenu({ user, setIsDrawerOpen, t }: any) {
  const { profile } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <div className="hidden md:flex items-center space-x-2 border border-border rounded-lg px-3 py-1.5">
            <span className="text-sm font-medium text-text-primary">
              <span className="text-primary font-semibold">
                {formatLAK(profile?.credit || 0)}
              </span>
            </span>
            <Link
              href="/topup"
              className="text-sm text-primary hover:underline font-medium"
            >
              {t("header.topUp")}
            </Link>
          </div>

          {/* Desktop avatar */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="hidden md:flex p-2 rounded-lg hover:bg-background-secondary transition-colors"
          >
            <Avatar {...getAvatarProps(profile, user)} size="md" />
          </button>

          {/* Mobile hamburger */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-background-secondary"
          >
            <Avatar {...getAvatarProps(profile, user)} size="md" />
          </button>
        </>
      ) : (
        <>
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-text-primary hover:text-primary transition-colors"
            >
              {t("header.signIn")}
            </Link>
            <Link href="/auth/signup" className="btn btn-primary text-sm">
              {t("header.signUp")}
            </Link>
            <LanguageSwitcher />
          </div>

          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-background-secondary"
          >
            <svg
              className="w-7 h-7 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
