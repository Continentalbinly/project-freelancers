'use client'

import { useState, useEffect, useCallback } from 'react'
import { defaultLanguage, supportedLanguages, Language } from './config'
import en from './en'
import lo from './lo'

const translations = {
    en,
    lo
} as const

export function useTranslation() {
    const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage)

    useEffect(() => {
        // Get language from localStorage or use default
        const savedLang = localStorage.getItem('lang') as Language
        if (savedLang && supportedLanguages.includes(savedLang)) {
            setCurrentLanguage(savedLang)
        }
    }, [])

    const t = useCallback((key: string) => {
        const currentTranslations = translations[currentLanguage] as unknown as Record<string, unknown>
        const defaultTranslations = translations[defaultLanguage] as unknown as Record<string, unknown>
        
        // Handle nested keys with dot notation
        const keys = key.split('.')
        let value: unknown = currentTranslations
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k]
            } else {
                // Fallback to default language
                value = defaultTranslations
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = (value as Record<string, unknown>)[fallbackKey]
                    } else {
                        return key // Return the key if not found
                    }
                }
                break
            }
        }
        
        return typeof value === 'string' ? value : key
    }, [currentLanguage])

    const changeLanguage = useCallback((lang: Language) => {
        setCurrentLanguage(lang)
        localStorage.setItem('lang', lang)
        document.documentElement.lang = lang
    }, [])

    const getCurrentLanguage = useCallback(() => currentLanguage, [currentLanguage])

    return {
        t,
        currentLanguage,
        changeLanguage,
        getCurrentLanguage
    }
} 