'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function TroubleshootingPage() {
  const { t } = useTranslationContext()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold   mb-6">
            {t('help.sections.troubleshooting.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.sections.troubleshooting.description')}
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
              We&apos;re creating a comprehensive troubleshooting guide. This guide will help you with:
            </p>

            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Common technical issues and solutions</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Account and login problems</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Payment and billing issues</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Getting additional support</span>
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