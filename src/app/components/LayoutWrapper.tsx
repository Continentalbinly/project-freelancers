"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "./header";
import Footer from "./footer/footer";
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
  const isSingleMessagePage = /^\/messages\/[^/]+$/.test(pathname || "");
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
      {!isSingleMessagePage && !isMessagesPage && <Header />}
      <main className="flex-1 pb-14 md:pb-0">{children}</main>
      {!loading &&
        !user &&
        !isPrivateRoute &&
        !isMessagesPage &&
        !isAuthPage &&
        !isSingleMessagePage && <Footer />}
      {!isMessagesPage && !isSingleMessagePage && <MobileNavBar />}
    </>
  );
}
