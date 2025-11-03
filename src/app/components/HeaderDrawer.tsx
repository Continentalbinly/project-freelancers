"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Info,
  LogOut,
  Settings,
  User,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/service/auth-client";
import LanguageSwitcher from "./LanguageSwitcher";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useEffect, useState } from "react";

export default function HeaderDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  t,
}: any) {
  const { user, profile } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  // ✅ Detect screen width
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const loggedInLinks = [
    ...(!isMobile
      ? [{ href: "/profile", label: t("header.profile"), icon: User }]
      : []),
  ];

  const guestLinks = [
    { href: "/freelancers", label: t("header.freelancers"), icon: Users },
    { href: "/clients", label: t("header.clients"), icon: Briefcase },
    { href: "/about", label: t("header.about"), icon: Info },
  ];

  const navLinks = user ? loggedInLinks : guestLinks;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center space-x-2"
              >
                <Image
                  src="/favicon.svg"
                  alt="UniJobs logo"
                  width={48}
                  height={48}
                  className="rounded-md"
                  priority
                />
              </Link>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-md hover:bg-background-secondary transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ✅ Scrollable content area (with safe bottom padding) */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 pb-24">
              {user ? (
                <>
                  {/* 👤 Profile Section + Credit + TopUp */}
                  <div className="flex flex-col gap-3 px-4 py-3 border border-border rounded-lg mb-4 bg-background-secondary/40">
                    <div className="flex items-center gap-3">
                      <Avatar {...getAvatarProps(profile, user)} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          {profile?.fullName || user.email}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {profile?.userType?.join(", ") || "Member"}
                        </div>
                      </div>
                    </div>

                    {/* 💰 Credit + Top Up button */}
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-border">
                      <span className="text-sm text-text-secondary">
                        {t("header.balance")}:{" "}
                        <span className="text-primary font-semibold">
                          ₭ {profile?.credit?.toLocaleString() || "0"}
                        </span>
                      </span>
                      <Link
                        href="/topup"
                        onClick={() => setIsDrawerOpen(false)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t("header.topUp")}
                      </Link>
                    </div>
                  </div>

                  {/* Links */}
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 text-text-primary hover:text-primary transition-all"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}

                  <Link
                    href="/settings"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 text-text-primary hover:text-primary transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t("header.settings")}
                    </span>
                  </Link>

                  <hr className="my-3 border-border" />

                  {/* 🚪 Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-error hover:bg-error/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      {t("header.signOut")}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Guest Links */}
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 text-text-primary hover:text-primary transition-all"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
