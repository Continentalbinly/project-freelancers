'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function FreelancersGuidePage() {
  const { t } = useTranslationContext()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Icon */}
          <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold   mb-6">
            {t('help.sections.forFreelancers.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.sections.forFreelancers.description')}
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
              We&apos;re creating a comprehensive guide for freelancers. This guide will cover:
            </p>

            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Finding and applying to projects</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Writing winning proposals</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Managing your profile and portfolio</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 shrink-0"></div>
                <span className="text-text-secondary">Getting paid and building your reputation</span>
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