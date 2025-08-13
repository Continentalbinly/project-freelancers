'use client'

import Link from 'next/link'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function HowItWorksPage() {
  const { t } = useTranslationContext()

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('howItWorks.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('howItWorks.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* For Freelancers Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('howItWorks.forFreelancers.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('howItWorks.forFreelancers.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forFreelancers.steps.0.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forFreelancers.steps.0.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forFreelancers.steps.1.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forFreelancers.steps.1.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forFreelancers.steps.2.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forFreelancers.steps.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('howItWorks.forClients.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('howItWorks.forClients.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forClients.steps.0.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forClients.steps.0.description')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forClients.steps.1.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forClients.steps.1.description')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl sm:text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.forClients.steps.2.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.forClients.steps.2.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t('howItWorks.platformFeatures.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t('howItWorks.platformFeatures.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.0.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.0.description')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.1.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.1.description')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.2.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.2.description')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.3.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.3.description')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.4.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.4.description')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                {t('howItWorks.platformFeatures.features.5.title')}
              </h3>
              <p className="text-text-secondary">
                {t('howItWorks.platformFeatures.features.5.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t('howItWorks.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('howItWorks.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=freelancer" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
              {t('howItWorks.cta.joinAsFreelancer')}
            </Link>
            <Link href="/auth/signup?type=client" className="btn bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg">
              {t('howItWorks.cta.joinAsClient')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 