"use client";

import { createContext, useContext, useEffect, Suspense } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Create a translation context
const TranslationContext = createContext<ReturnType<
  typeof useTranslation
> | null>(null);

// Custom hook to use translation context
export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationContext must be used within a TranslationProvider"
    );
  }
  return context;
};

// ✅ Inner component that actually uses the hook
function LanguageProviderInner({ children }: { children: React.ReactNode }) {
  const translation = useTranslation();

  useEffect(() => {
    // Keep <html lang="xx"> in sync
    document.documentElement.lang = translation.currentLanguage;
  }, [translation.currentLanguage]);

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
}

// ✅ Exported provider wrapped in <Suspense>
export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading language...</div>}>
      <LanguageProviderInner>{children}</LanguageProviderInner>
    </Suspense>
  );
}
