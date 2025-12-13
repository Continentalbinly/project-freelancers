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

// 🔹 Lightweight, non-blocking loading bar tucked under the header
function LanguageLoadingScreen() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5">
      <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-primary animate-[shimmer_1.4s_linear_infinite] opacity-90 shadow-sm" />
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
