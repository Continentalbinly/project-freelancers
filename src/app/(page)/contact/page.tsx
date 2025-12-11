'use client'

import { useState } from 'react'
import { useTranslationContext } from '@/app/components/LanguageProvider'

export default function ContactPage() {
  const { t } = useTranslationContext()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-background ">
      {/* Hero Section */}
      <section className="bg-background-secondary py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.sendMessage')}</h2>

              {submitted ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">{t('contact.successTitle')}</h3>
                  </div>
                  <p className="text-green-700 dark:text-green-300">
                    {t('contact.successMessage')}
                  </p>
                  <button suppressHydrationWarning
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('contact.fullName')}
                    </label>
                    <input suppressHydrationWarning
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('contact.fullNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('contact.email')}
                    </label>
                    <input suppressHydrationWarning
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('contact.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('contact.subject')}
                    </label>
                    <input suppressHydrationWarning
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('contact.subjectPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {t('contact.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </div>

                  <button suppressHydrationWarning
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('contact.sending') : t('contact.sendMessageButton')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.getInTouch')}</h2>

              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.emailSupport')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('contact.emailAddress')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact.emailResponse')}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.phoneSupport')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('contact.phoneNumber')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact.phoneHours')}</p>
                  </div>
                </div>

                {/* Office */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('contact.officeAddress')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-line">
                      {t('contact.officeLocation')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('contact.officeNote')}</p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('contact.quickHelp')}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('contact.quickHelpDesc')}
                </p>
                <a href="/faq" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  {t('contact.viewFaq')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.faqTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('contact.faqSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FAQ Item 1 */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faqStudentTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.faqStudentAnswer')}
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faqTeacherTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.faqTeacherAnswer')}
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faqPaymentTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.faqPaymentAnswer')}
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('contact.faqDisputeTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('contact.faqDisputeAnswer')}
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/faq" className="btn btn-primary px-8 py-3">
              {t('contact.viewAllFaq')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 
