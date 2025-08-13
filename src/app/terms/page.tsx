'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

export default function TermsOfServicePage() {
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-primary hover:text-primary-dark transition-colors mb-4 inline-block">
            ← {t('header.home')}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{t('termsPage.title')}</h1>
          <p className="text-text-secondary">
            {t('termsPage.lastUpdated')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sm:p-8">
          <div className="prose prose-lg max-w-none">
            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.acceptance.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.acceptance.content')}
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.description.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.description.content')}
              </p>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.userAccounts.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.userAccounts.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.userAccounts.items.map((item: string, index: number) => (
                  <p key={index}>{index + 1}. {item}</p>
                ))}
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.userResponsibilities.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.userResponsibilities.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.userResponsibilities.items.map((item: any, index: number) => (
                  <p key={index}>
                    <strong>{item.role}</strong> {item.description}
                  </p>
                ))}
              </div>
            </section>

            {/* Payment and Fees */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.paymentAndFees.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.paymentAndFees.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.paymentAndFees.items.map((item: string, index: number) => (
                  <p key={index}>{index + 1}. {item}</p>
                ))}
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.intellectualProperty.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.intellectualProperty.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.intellectualProperty.items.map((item: string, index: number) => (
                  <p key={index}>{index + 1}. {item}</p>
                ))}
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.disputeResolution.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.disputeResolution.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.disputeResolution.items.map((item: string, index: number) => (
                  <p key={index}>{index + 1}. {item}</p>
                ))}
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.limitationOfLiability.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.limitationOfLiability.content')}
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.termination.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.termination.content')}
              </p>
              <div className="space-y-4 text-text-secondary">
                {translations.termsPage.sections.termination.items.map((item: string, index: number) => (
                  <p key={index}>{index + 1}. {item}</p>
                ))}
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.changesToTerms.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.changesToTerms.content')}
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('termsPage.sections.contactInformation.title')}</h2>
              <p className="text-text-secondary mb-4">
                {t('termsPage.sections.contactInformation.content')}{' '}
                <a href={`mailto:${t('termsPage.sections.contactInformation.email')}`} className="text-primary hover:underline">
                  {t('termsPage.sections.contactInformation.email')}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 