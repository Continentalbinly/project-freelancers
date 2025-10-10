'use client'

import { useState } from 'react'
import { useTranslationContext } from '@/app/components/LanguageProvider'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'freelancers' | 'clients' | 'payments' | 'technical'
}

export default function FAQPage() {
  const { t } = useTranslationContext()
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'freelancers' | 'clients' | 'payments' | 'technical'>('all')
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqData: FAQItem[] = [
    // General Questions
    {
      question: t('faq.questions.whatIsUniJobs.question'),
      answer: t('faq.questions.whatIsUniJobs.answer'),
      category: "general"
    },
    {
      question: t('faq.questions.howDoesItWork.question'),
      answer: t('faq.questions.howDoesItWork.answer'),
      category: "general"
    },
    {
      question: t('faq.questions.isItFree.question'),
      answer: t('faq.questions.isItFree.answer'),
      category: "general"
    },
    {
      question: t('faq.questions.projectTypes.question'),
      answer: t('faq.questions.projectTypes.answer'),
      category: "general"
    },

    // Freelancer Questions
    {
      question: t('faq.questions.howToStartAsFreelancer.question'),
      answer: t('faq.questions.howToStartAsFreelancer.answer'),
      category: "freelancers"
    },
    {
      question: t('faq.questions.whatSkillsNeeded.question'),
      answer: t('faq.questions.whatSkillsNeeded.answer'),
      category: "freelancers"
    },
    {
      question: t('faq.questions.howMuchCanIEarn.question'),
      answer: t('faq.questions.howMuchCanIEarn.answer'),
      category: "freelancers"
    },
    {
      question: t('faq.questions.howDoIGetPaid.question'),
      answer: t('faq.questions.howDoIGetPaid.answer'),
      category: "freelancers"
    },
    {
      question: t('faq.questions.whatIfICantComplete.question'),
      answer: t('faq.questions.whatIfICantComplete.answer'),
      category: "freelancers"
    },

    // Client Questions
    {
      question: t('faq.questions.howToPostProject.question'),
      answer: t('faq.questions.howToPostProject.answer'),
      category: "clients"
    },
    {
      question: t('faq.questions.howToChooseFreelancer.question'),
      answer: t('faq.questions.howToChooseFreelancer.answer'),
      category: "clients"
    },
    {
      question: t('faq.questions.whatIfNotSatisfied.question'),
      answer: t('faq.questions.whatIfNotSatisfied.answer'),
      category: "clients"
    },
    {
      question: t('faq.questions.howMuchToBudget.question'),
      answer: t('faq.questions.howMuchToBudget.answer'),
      category: "clients"
    },
    {
      question: t('faq.questions.canIHireSameFreelancer.question'),
      answer: t('faq.questions.canIHireSameFreelancer.answer'),
      category: "clients"
    },

    // Payment Questions
    {
      question: t('faq.questions.howDoPaymentsWork.question'),
      answer: t('faq.questions.howDoPaymentsWork.answer'),
      category: "payments"
    },
    {
      question: t('faq.questions.whatPaymentMethods.question'),
      answer: t('faq.questions.whatPaymentMethods.answer'),
      category: "payments"
    },
    {
      question: t('faq.questions.whenDoFreelancersGetPaid.question'),
      answer: t('faq.questions.whenDoFreelancersGetPaid.answer'),
      category: "payments"
    },
    {
      question: t('faq.questions.areThereFees.question'),
      answer: t('faq.questions.areThereFees.answer'),
      category: "payments"
    },

    // Technical Questions
    {
      question: t('faq.questions.technicalIssues.question'),
      answer: t('faq.questions.technicalIssues.answer'),
      category: "technical"
    },
    {
      question: t('faq.questions.isDataSecure.question'),
      answer: t('faq.questions.isDataSecure.answer'),
      category: "technical"
    },
    {
      question: t('faq.questions.canIUseOnMobile.question'),
      answer: t('faq.questions.canIUseOnMobile.answer'),
      category: "technical"
    },
    {
      question: t('faq.questions.howToUpdateProfile.question'),
      answer: t('faq.questions.howToUpdateProfile.answer'),
      category: "technical"
    }
  ]

  const categories = [
    { id: 'all', name: t('faq.categories.all') },
    { id: 'general', name: t('faq.categories.general') },
    { id: 'freelancers', name: t('faq.categories.freelancers') },
    { id: 'clients', name: t('faq.categories.clients') },
    { id: 'payments', name: t('faq.categories.payments') },
    { id: 'technical', name: t('faq.categories.technical') }
  ]

  const filteredFAQ = activeCategory === 'all'
    ? faqData
    : faqData.filter(item => item.category === activeCategory)

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('faq.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-background-secondary text-text-secondary hover:text-primary'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQ.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-border">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-secondary transition-colors"
                >
                  <h3 className="text-lg font-semibold text-text-primary pr-4">
                    {item.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-text-secondary transition-transform ${openItems.includes(index) ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-text-secondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredFAQ.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">
                {t('faq.noResults')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
            {t('faq.contactSection.title')}
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            {t('faq.contactSection.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn btn-primary px-8 py-3">
              {t('faq.contactSection.contactSupport')}
            </a>
            <a href="/help" className="btn btn-outline px-8 py-3">
              {t('faq.contactSection.helpCenter')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 