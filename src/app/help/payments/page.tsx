'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function PaymentsGuidePage() {
  const { t } = useTranslationContext()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            {t('help.sections.payments.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.sections.payments.description')}
          </p>

          {/* Coming Soon Message */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-8 sm:p-12 mb-8">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Coming Soon!
            </h2>

            <p className="text-text-secondary mb-6">
              We're creating a comprehensive payments and billing guide. This guide will cover:
            </p>

            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Setting up payment methods</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Understanding fees and charges</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Payment processing and timelines</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Managing billing information and invoices</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help" className="btn btn-primary px-8 py-3">
              Back to Help Center
            </Link>
            <Link href="/contact" className="btn btn-outline px-8 py-3">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 