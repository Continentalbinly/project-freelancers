"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8">
        {children}
      </div>
    </div>
  );
}
