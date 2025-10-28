"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // ✅ import this
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
// import HeaderSearch from "./HeaderSearch";
import HeaderNav from "./HeaderNav";
import HeaderUserMenu from "./HeaderUserMenu";
import HeaderDrawer from "./HeaderDrawer";

export default function Header() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* <HeaderSearch /> */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ✅ Logo replaced */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/favicon.svg"
                alt="UniJobs logo"
                width={60}
                height={60}
                className="rounded-md"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <HeaderNav pathname={pathname} t={t} user={user} />

            {/* Right Section */}
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
