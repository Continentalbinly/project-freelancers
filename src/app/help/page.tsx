'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function HelpPage() {
  const { t } = useTranslationContext()

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('help.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('help.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('help.quickHelp.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('help.quickHelp.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.gettingStarted.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.gettingStarted.description')}
              </p>
              <Link href="/help/getting-started" className="text-primary hover:text-primary-hover font-medium">
                {t('help.sections.gettingStarted.link')}
              </Link>
            </div>

            {/* For Freelancers */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.forFreelancers.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.forFreelancers.description')}
              </p>
              <Link href="/help/freelancers" className="text-secondary hover:text-secondary-hover font-medium">
                {t('help.sections.forFreelancers.link')}
              </Link>
            </div>

            {/* For Clients */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.forClients.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.forClients.description')}
              </p>
              <Link href="/help/clients" className="text-success hover:text-success/80 font-medium">
                {t('help.sections.forClients.link')}
              </Link>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.payments.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.payments.description')}
              </p>
              <Link href="/help/payments" className="text-warning hover:text-warning/80 font-medium">
                {t('help.sections.payments.link')}
              </Link>
            </div>

            {/* Safety */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.safety.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.safety.description')}
              </p>
              <Link href="/help/safety" className="text-info hover:text-info/80 font-medium">
                {t('help.sections.safety.link')}
              </Link>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">{t('help.sections.troubleshooting.title')}</h3>
              <p className="text-text-secondary mb-4">
                {t('help.sections.troubleshooting.description')}
              </p>
              <Link href="/help/troubleshooting" className="text-primary hover:text-primary-hover font-medium">
                {t('help.sections.troubleshooting.link')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('help.videoTutorials.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('help.videoTutorials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tutorial 1 */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="aspect-video bg-background-secondary flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-text-secondary">{t('help.videoTutorials.comingSoon')}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('help.videoTutorials.tutorials.gettingStarted.title')}</h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('help.videoTutorials.tutorials.gettingStarted.description')}
                </p>
                <span className="text-xs text-text-secondary">{t('help.videoTutorials.tutorials.gettingStarted.duration')}</span>
              </div>
            </div>

            {/* Tutorial 2 */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="aspect-video bg-background-secondary flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-text-secondary">{t('help.videoTutorials.comingSoon')}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('help.videoTutorials.tutorials.postProject.title')}</h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('help.videoTutorials.tutorials.postProject.description')}
                </p>
                <span className="text-xs text-text-secondary">{t('help.videoTutorials.tutorials.postProject.duration')}</span>
              </div>
            </div>

            {/* Tutorial 3 */}
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="aspect-video bg-background-secondary flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-text-secondary">{t('help.videoTutorials.comingSoon')}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{t('help.videoTutorials.tutorials.submittingProposals.title')}</h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t('help.videoTutorials.tutorials.submittingProposals.description')}
                </p>
                <span className="text-xs text-text-secondary">{t('help.videoTutorials.tutorials.submittingProposals.duration')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
            {t('help.contactSupport.title')}
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('help.contactSupport.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn btn-primary px-8 py-3">
              {t('help.contactSupport.contactSupport')}
            </Link>
            <Link href="/faq" className="btn btn-outline px-8 py-3">
              {t('help.contactSupport.viewFaq')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 