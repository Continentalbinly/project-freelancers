export const languages = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  lo: {
    name: 'Lao',
    nativeName: 'Lao',
    flag: '🇱🇦'
  }
} as const

export type Language = keyof typeof languages

export const defaultLanguage: Language = 'lo'

export const supportedLanguages: Language[] = ['en', 'lo']

export function isValidLanguage(lang: string): lang is Language {
  return supportedLanguages.includes(lang as Language)
} 