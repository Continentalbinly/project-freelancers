"use client";

import { createContext, useContext, useEffect, Suspense } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// 🔹 Context setup
const TranslationContext = createContext<ReturnType<
  typeof useTranslation
> | null>(null);

// 🔹 Custom hook
export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationContext must be used within a LanguageProvider"
    );
  }
  return context;
};

// 🔹 Inner provider that uses the hook
function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const translation = useTranslation();

  useEffect(() => {
    document.documentElement.lang = translation.currentLanguage;
  }, [translation.currentLanguage]);

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
}

// 🔹 Simple shimmer loading UI
function LanguageLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 z-[9999]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
      <p className="text-text-secondary font-medium tracking-wide">
        Loading language settings…
      </p>
    </div>
  );
}

// 🔹 Exported provider wrapped in Suspense
export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LanguageLoadingScreen />}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  );
}
