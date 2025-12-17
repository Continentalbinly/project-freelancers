"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto max-w-sm sm:max-w-md lg:max-w-6xl xl:max-w-7xl">
        {children}
      </div>
    </div>
  );
}
