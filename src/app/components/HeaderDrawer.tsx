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
  Shield,
  FolderOpen,
  BanknoteArrowDown,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { logoutUser } from "@/service/auth-client";
import LanguageSwitcher from "./LanguageSwitcher";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/service/firebase";

export default function HeaderDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  t,
}: any) {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [openFinance, setOpenFinance] = useState(false);
  const [liveCredit, setLiveCredit] = useState<number | null>(
    profile?.credit || 0
  );

  /** Realtime credit listener */
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, "profiles", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLiveCredit(data.credit || 0);
      }
    });

    return () => unsub();
  }, [user?.uid]);

  /** Logout handler */
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  /** Admin role check */
  const isAdmin =
    (Array.isArray(profile?.userRoles) &&
      profile.userRoles
        .map((r: string) => r.toLowerCase())
        .includes("admin")) ||
    (Array.isArray(profile?.userType) &&
      profile.userType.map((r: string) => r.toLowerCase()).includes("admin"));

  /** Detect mobile width */
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

  /** Role check */
  const roles = Array.isArray(profile?.userRoles)
    ? profile.userRoles.map((r: string) => r.toLowerCase())
    : [];
  const types = Array.isArray(profile?.userType)
    ? profile.userType.map((r: string) => r.toLowerCase())
    : [];
  const category = (profile?.userCategory || "").toLowerCase();

  const isClient =
    roles.includes("client") ||
    types.includes("client") ||
    category.includes("client");

  const canManageProjects = isClient || isAdmin;

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
            className="fixed right-0 top-0 bottom-0 w-72 bg-background z-50 shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
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
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-background-secondary dark:hover:bg-gray-800 transition cursor-pointer"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <LanguageSwitcher />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-md hover:bg-background-secondary dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-primary dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Nav scrollable area */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 pb-24 bg-background">
              {user ? (
                <>
                  {/* Profile section */}
                  <div className="flex flex-col gap-3 px-4 py-3 border border-border dark:border-gray-700 rounded-lg mb-4 bg-background-secondary dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <Avatar {...getAvatarProps(profile, user)} size="sm" />
                      <div>
                        <div className="text-sm font-semibold text-text-primary dark:text-gray-100">
                          {profile?.fullName || user.email}
                        </div>
                        <div className="text-xs text-text-secondary dark:text-gray-400">
                          {profile?.userType?.join(", ") || "Member"}
                        </div>
                      </div>
                    </div>

                    {/* Credit */}
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-border dark:border-gray-700">
                      <span className="text-sm text-text-secondary dark:text-gray-400">
                        {t("header.balance")}:{" "}
                        <span className="text-primary font-semibold">
                          {liveCredit?.toLocaleString() ?? "0"}
                        </span>
                      </span>
                    </div>

                    {/* Admin Panel */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300 hover:text-primary transition-all"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {t("header.adminPanel")}
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* General navigation */}
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300 hover:text-primary transition-all"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}

                  {/* ---------------------- FINANCE ACCORDION ---------------------- */}
                  <div className="px-0">
                    <button
                      onClick={() => setOpenFinance(!openFinance)}
                      className="flex cursor-pointer items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <BanknoteArrowDown className="w-5 h-5" />
                        {t("header.finance")}
                      </div>

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

                    {openFinance && (
                      <div className="flex flex-col gap-0">
                        <Link
                          href="/transactions"
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-sm px-4 py-2 ml-6 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300"
                        >
                          {t("header.transactions")}
                        </Link>

                        <Link
                          href="/topup"
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-sm px-4 py-2 ml-6 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300"
                        >
                          {t("header.topUp")}
                        </Link>

                        <Link
                          href="/withdraw"
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-sm px-4 py-2 ml-6 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300"
                        >
                          {t("header.withdraw")}
                        </Link>

                        <Link
                          href="/pricing"
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-sm px-4 py-2 ml-6 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300"
                        >
                          {t("header.subscription")}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Project Management */}
                  {canManageProjects && (
                    <Link
                      href="/projects/manage"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300 hover:text-primary transition-all"
                    >
                      <FolderOpen className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {t("header.projectManage")}
                      </span>
                    </Link>
                  )}

                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300 hover:text-primary transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {t("header.settings")}
                    </span>
                  </Link>

                  <hr className="my-3 border-border dark:border-gray-700" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 w-full cursor-pointer text-left rounded-lg text-error hover:bg-error/10 dark:hover:bg-error/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      {t("header.signOut")}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 text-text-primary dark:text-gray-300 hover:text-primary transition-all"
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
