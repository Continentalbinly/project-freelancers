'use client'

import { createContext, useContext, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/useTranslation'

// Create a translation context
const TranslationContext = createContext<ReturnType<typeof useTranslation> | null>(null)

// Custom hook to use translation context
export const useTranslationContext = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider')
  }
  return context
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const translation = useTranslation()

  useEffect(() => {
    // Set the language attribute on the html element
    document.documentElement.lang = translation.currentLanguage
  }, [translation.currentLanguage])

  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  )
} 