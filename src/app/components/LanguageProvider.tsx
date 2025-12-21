"use client";

import { createContext, useContext, useEffect, Suspense, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { defaultLanguage } from "@/lib/i18n/config";
import en from "@/lib/i18n/en";

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

// 🔹 Default/fallback translation object for Suspense fallback
function createFallbackTranslation() {
  const fallbackT = (key: string) => {
    const keys = key.split(".");
    let value: any = en;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return {
    t: fallbackT,
    currentLanguage: defaultLanguage,
    changeLanguage: () => {},
    getCurrentLanguage: () => defaultLanguage,
  };
}

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

// 🔹 Lightweight, non-blocking loading bar at the top
function LanguageLoadingBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
      <div className="h-full w-full bg-gradient-to-r from-primary via-secondary to-primary animate-[shimmer_1.4s_linear_infinite] opacity-90 shadow-sm" />
    </div>
  );
}

// 🔹 Fallback provider that provides default translation context
function LanguageProviderFallback({ children }: { children: React.ReactNode }) {
  const [fallbackTranslation] = useState(() => createFallbackTranslation());

  useEffect(() => {
    document.documentElement.lang = defaultLanguage;
  }, []);

  return (
    <TranslationContext.Provider value={fallbackTranslation}>
      <LanguageLoadingBar />
      {children}
    </TranslationContext.Provider>
  );
}

// 🔹 Exported provider wrapped in Suspense
export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LanguageProviderFallback>{children}</LanguageProviderFallback>}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  );
}
