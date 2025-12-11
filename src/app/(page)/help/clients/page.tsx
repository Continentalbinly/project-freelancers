'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function ClientsGuidePage() {
  const { t } = useTranslationContext()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold   mb-6">
            {t('help.sections.forClients.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.sections.forClients.description')}
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
              We're creating a comprehensive guide for clients. This guide will cover:
            </p>

            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Creating compelling project descriptions</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Reviewing and selecting proposals</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Managing project timelines and communication</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-text-secondary">Payment processing and project completion</span>
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