"use client";
import Link from "next/link";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useAuth } from "@/contexts/AuthContext";
import { formatLAK } from "@/service/currencyUtils";
import LanguageSwitcher from "./LanguageSwitcher";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeaderUserMenu({ user, setIsDrawerOpen, t }: any) {
  const { profile } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect device width (mobile < 768px)
  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // ✅ Handle message click differently by device
  const handleMessagesClick = (e: React.MouseEvent) => {
    if (!isMobile) {
      e.preventDefault(); // stop normal navigation
      window.open("/messages", "_blank", "noopener,noreferrer"); // open in new tab
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          {/* 💬 Messages icon — opens new tab on desktop, same page on mobile */}
          <Link
            href="/messages"
            onClick={handleMessagesClick}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title={t("header.messages")}
          >
            <MessageCircle className="w-5 h-5 text-text-primary hover:text-primary transition-colors" />
          </Link>

          {/* 🧑‍💻 Avatar button (drawer toggle) */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
            title={t("header.account")}
          >
            <Avatar {...getAvatarProps(profile, user)} size="md" />
          </button>
        </>
      ) : (
        <>
          {/* 👤 Guest links */}
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

          {/* 📱 Mobile menu button */}
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
