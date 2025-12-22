'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

export default function CookiePolicyPage() {
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-primary-hover transition-colors mb-4 inline-block">
            ← {t('header.home')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('cookiePolicy.title')}</h1>
          <p className="text-text-secondary">
            {t('cookiePolicy.lastUpdated')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl shadow-sm border border-border p-6 sm:p-8">
          <div className="prose prose-lg max-w-none">
            {/* What Are Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('cookiePolicy.sections.whatAreCookies.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('cookiePolicy.sections.whatAreCookies.content')}
              </p>
            </section>

            {/* How We Use Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t('cookiePolicy.sections.howWeUseCookies.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('cookiePolicy.sections.howWeUseCookies.content')}
              </p>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                {translations.cookiePolicy.sections.howWeUseCookies.items.map((item: { type: string; description: string }, index: number) => (
                  <p key={index}>
                    <strong>{item.type}</strong> {item.description}
                  </p>
                ))}
              </div>
            </section>

            {/* Types of Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.typesOfCookies.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.typesOfCookies.content')}
              </p>
              <div className="space-y-6">
                {translations.cookiePolicy.sections.typesOfCookies.items.map((item: { title: string; description: string }, index: number) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Specific Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.specificCookies.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.specificCookies.content')}
              </p>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                {translations.cookiePolicy.sections.specificCookies.items.map((item: { title: string; description: string }, index: number) => (
                  <div key={index} className="p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.managingCookies.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.managingCookies.content')}
              </p>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {translations.cookiePolicy.sections.managingCookies.items.map((item: { method: string; description: string }, index: number) => (
                    <li key={index}>
                      <strong>{item.method}</strong> {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Impact of Disabling */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.impactOfDisabling.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.impactOfDisabling.content')}
              </p>
            </section>

            {/* Updates to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.updatesToPolicy.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.updatesToPolicy.content')}
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('cookiePolicy.sections.contactUs.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('cookiePolicy.sections.contactUs.content')}{' '}
                <a href={`mailto:${t('cookiePolicy.sections.contactUs.email')}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {t('cookiePolicy.sections.contactUs.email')}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 