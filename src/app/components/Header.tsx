"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import HeaderNav from "./HeaderNav";
import HeaderUserMenu from "./HeaderUserMenu";
import HeaderDrawer from "./HeaderDrawer";

export default function Header() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <button onClick={() => router.push("/")} className="flex items-center space-x-2 cursor-pointer">
              <Image
                src="/favicon.svg"
                alt="UniJobs logo"
                width={50}
                height={50}
                className="rounded-md"
                priority
              />
            </button>
          </div>

          {/* Center: Navigation (absolutely centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
            <HeaderNav pathname={pathname} />
          </div>

          {/* Right: User Menu / Language / Auth */}
          <div className="flex items-center ml-auto">
            <HeaderUserMenu
              user={user}
              setIsDrawerOpen={setIsDrawerOpen}
              t={t}
              pathname={pathname}
            />
          </div>
        </div>

        {/* Drawer (mobile menu) */}
        <HeaderDrawer
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          t={t}
        />
      </header>
    </>
  );
}
