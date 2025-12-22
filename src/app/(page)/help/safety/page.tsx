'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function SafetyGuidePage() {
  const { t } = useTranslationContext()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold   mb-6">
            {t('help.sections.safety.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.sections.safety.description')}
          </p>

          {/* Coming Soon Message */}
          <div className="rounded-xl shadow-sm border border-border p-8 sm:p-12 mb-8">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold   mb-4">
              Coming Soon!
            </h2>
            
            <p className="text-text-secondary mb-6">
              We&apos;re creating a comprehensive safety and security guide. This guide will cover:
            </p>
            
            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-info rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Platform security measures</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-info rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Protecting your personal information</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-info rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Safe communication practices</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-info rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Reporting issues and getting help</span>
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