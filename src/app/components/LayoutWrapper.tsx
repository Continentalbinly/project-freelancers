"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "./header";
import Footer from "./footer";
import MobileNavBar from "./MobileNavBar";
import { useAuth } from "@/contexts/AuthContext";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isMessagesPage = pathname?.startsWith("/messages");
  const isAuthPage = pathname?.startsWith("/auth");
  const isPrivateRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/projects") ||
    pathname?.startsWith("/proposals") ||
    pathname?.startsWith("/profile");

  useEffect(() => {
    document.body.style.overflow = isMessagesPage ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMessagesPage]);

  return (
    <>
      <Header />
      <main className="flex-1 pb-14 md:pb-0">{children}</main>

      {/* ✅ Desktop Footer (public pages only) */}
      {!loading &&
        !user &&
        !isPrivateRoute &&
        !isMessagesPage &&
        !isAuthPage && <Footer />}

      {/* ✅ Mobile Bottom Navigation (always for mobile) */}
      {!isMessagesPage && <MobileNavBar />}
    </>
  );
}
