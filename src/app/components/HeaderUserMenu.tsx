"use client";
import { useRouter } from "next/navigation";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Sun, Moon, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { useNotifications } from "./hooks/useNotifications";

export default function HeaderUserMenu({ setIsDrawerOpen, t }: any) {
  const { user, profile, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Get notification count
  const { unreadCount } = useNotifications({
    userId: user?.uid || null,
    limitCount: 1, // We only need the count
  });

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
      e.preventDefault();
      window.open("/messages", "_blank", "noopener,noreferrer");
    }
  };

  // 🌀 Show shimmer skeleton while auth is loading
  if (loading) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="w-5 h-5 bg-background-tertiary rounded-lg" />
        <div className="w-8 h-8 bg-background-tertiary rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          {/* 🔔 Notifications button - dropdown on desktop, navigate on mobile */}
          <div className="relative">
            {isMobile ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/notifications");
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title={t("header.notifications") || "Notifications"}
              >
                <Bell className="w-5 h-5 text-text-primary hover:text-primary dark:hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <NotificationsDropdown userId={user.uid} />
            )}
          </div>

          {/* 💬 Messages icon — open in new tab on desktop */}
          <button
            onClick={(e) => {
              if (!isMobile) {
                e.preventDefault();
                window.open("/messages", "_blank", "noopener,noreferrer");
              } else {
                router.push("/messages");
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title={t("header.messages")}
          >
            <MessageCircle className="w-5 h-5 text-text-primary hover:text-primary dark:hover:text-primary transition-colors" />
          </button>

          {/* 🧑‍💻 Avatar button — opens drawer */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-shrink-0"
            title={t("header.account") || profile?.fullName || user?.email || "Account"}
          >
            {user && (
              <Avatar 
                key={`avatar-${user.uid}-${profile?.avatarUrl || 'no-avatar'}`}
                {...getAvatarProps(profile, user)} 
                size="md" 
              />
            )}
          </button>
        </>
      ) : (
        <>
          {/* 👤 Guest links — Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm font-medium text-text-primary hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
            >
              {t("header.signIn")}
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              className="btn btn-primary text-sm px-4 py-1.5 cursor-pointer"
            >
              {t("header.signUp")}
            </button>
            {/* Theme toggle for logged-out users */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? (t("header.lightMode") || 'Switch to light mode') : (t("header.darkMode") || 'Switch to dark mode')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <LanguageSwitcher />
          </div>

          {/* 📱 Mobile drawer toggle */}
          <button
            suppressHydrationWarning
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t("header.menu")}
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
