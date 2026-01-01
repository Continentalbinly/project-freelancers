"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/app/components/footer/footer";
import MobileNavBar from "@/app/components/MobileNavBar";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/app/components/Header";

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
  const isNotificationsPage = pathname?.startsWith("/notifications");
  
  // 🎯 Project routes that should hide footer (private routes)
  const isPrivateProjectRoute =
    pathname?.startsWith("/projects/create") ||
    pathname?.startsWith("/projects/manage") ||
    pathname?.startsWith("/projects/") && /^\/projects\/[^/]+\/(edit|proposals|propose)$/.test(pathname || "");
  
  const isPrivateRoute =
    pathname?.startsWith("/dashboard") ||
    isPrivateProjectRoute ||
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

      {/* 📱 Mobile Navigation (hidden for messages + admin + notifications) */}
      {!isMessagesPage && !isSingleMessagePage && !isAdminPage && !isNotificationsPage && (
        <MobileNavBar />
      )}
    </>
  );
}
