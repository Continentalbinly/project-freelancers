"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/service/auth-client";

export default function HeaderDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  t,
}: any) {
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  return (
    <Transition.Root show={isDrawerOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsDrawerOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div suppressHydrationWarning className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                suppressHydrationWarning
                className="w-screen max-w-xs bg-white shadow-xl border-l border-border flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">U</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      UniJobs
                    </span>
                  </div>
                  <button suppressHydrationWarning
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-lg hover:bg-background-secondary"
                  >
                    ✕
                  </button>
                </div>

                {/* Drawer Content */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  {user ? (
                    <>
                      {/* Profile Summary */}
                      <div
                        suppressHydrationWarning
                        className="flex items-center space-x-3 mb-6"
                      >
                        <Avatar {...getAvatarProps(profile, user)} size="md" />
                        <div>
                          <div className="font-semibold text-text-primary">
                            {profile?.fullName || user.email}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {profile?.userType?.join(", ") || "Member"}
                          </div>
                        </div>
                      </div>

                      {/* Authenticated Links */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium"
                      >
                        {t("header.dashboard")}
                      </Link>

                      {/* ✅ New Transactions Link */}
                      <Link
                        href="/transactions"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium items-center gap-2"
                      >
                        {t("header.transactions")}
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium"
                      >
                        {t("header.profile")}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium"
                      >
                        {t("header.settings")}
                      </Link>

                      <hr className="my-2 border-border" />

                      {/* Logout */}
                      <button suppressHydrationWarning
                        onClick={handleLogout}
                        className="block w-full text-left px-2 py-2 rounded hover:bg-background-secondary text-error font-medium"
                      >
                        {t("header.signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Non-authenticated */}
                      {["home", "projects", "about"].map((link) => (
                        <Link
                          key={link}
                          href={`/${link === "home" ? "" : link}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="block px-2 py-2 rounded hover:bg-background-secondary text-text-primary font-medium"
                        >
                          {t(`header.${link}`)}
                        </Link>
                      ))}
                      <hr className="my-2 border-border" />
                      <Link
                        href="/auth/login"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 rounded text-primary font-medium"
                      >
                        {t("header.signIn")}
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-2 py-2 bg-primary text-white rounded font-medium text-center"
                      >
                        {t("header.signUp")}
                      </Link>
                    </>
                  )}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
