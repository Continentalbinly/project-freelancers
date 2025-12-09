"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Footer from "./footer/footer";
import MobileNavBar from "./MobileNavBar";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // 🎯 Route flags
  const isMessagesPage = pathname?.startsWith("/messages");
  const isSingleMessagePage = /^\/messages\/[^/]+$/.test(pathname || "");
  const isAuthPage = pathname?.startsWith("/auth");
  const isPrivateRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/projects") ||
    pathname?.startsWith("/proposals") ||
    pathname?.startsWith("/profile");

  // 🛡️ NEW: hide global header/footer for admin pages
  const isAdminPage = pathname?.startsWith("/admin");

  // 🧭 Disable scroll lock for message view
  useEffect(() => {
    document.body.style.overflow = isMessagesPage ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMessagesPage]);

  return (
    <>
      {/* 🌐 Global Header (hidden for admin pages) */}
      {!isSingleMessagePage && !isMessagesPage && !isAdminPage && <Header />}

      {/* 🧩 Page Content */}
      <main className="flex-1 pb-14 md:pb-0">{children}</main>

      {/* 🌍 Global Footer (hidden for admin pages & restricted routes) */}
      {!loading &&
        !user &&
        !isPrivateRoute &&
        !isMessagesPage &&
        !isAuthPage &&
        !isSingleMessagePage &&
        !isAdminPage && <Footer />}

      {/* 📱 Mobile Navigation (hidden for messages + admin) */}
      {!isMessagesPage && !isSingleMessagePage && !isAdminPage && (
        <MobileNavBar />
      )}
    </>
  );
}
