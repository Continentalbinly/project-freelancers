"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import PricingFuturePlans from "../../components/PricingFuturePlans";

export default function PricingPage() {
  const { t, currentLanguage } = useTranslationContext();

  // Get the current translation object
  const translations = currentLanguage === "lo" ? lo : en;

  return (
    <div className="bg-background text-text-primary">
      {/* Current Phase - Free Launch */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-success/10 text-success border border-success/30 rounded-full text-sm font-medium mb-6">
              {t("pricing.launchPhase.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t("pricing.launchPhase.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t("pricing.launchPhase.subtitle")}
            </p>
          </div>

          {/* First Launch Notice */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-background-tertiary border border-border rounded-xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                    {t("pricing.launchPhase.notice.title")}
                  </h3>
                  <p className="text-base text-text-secondary mb-3">
                    {t("pricing.launchPhase.notice.message")}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t("pricing.launchPhase.notice.details")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl shadow-lg border border-border bg-background p-8 sm:p-12">
              <div className="text-center mb-8">
                <div className="text-5xl sm:text-6xl font-semibold text-primary mb-4">
                  {t("pricing.launchPhase.currentPlan.price")}
                </div>
                <div className="text-2xl font-semibold text-text-primary mb-2">
                  {t("pricing.launchPhase.currentPlan.period")}
                </div>
                <div className="text-text-secondary">
                  {t("pricing.launchPhase.currentPlan.description")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {t("pricing.launchPhase.forFreelancers.title")}
                  </h3>
                  <ul className="space-y-3">
                    {translations.pricing.launchPhase.forFreelancers.features.map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-text-secondary"
                        >
                          <svg
                            className="w-5 h-5 text-success mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {t("pricing.launchPhase.forClients.title")}
                  </h3>
                  <ul className="space-y-3">
                    {translations.pricing.launchPhase.forClients.features.map(
                      (feature: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center text-text-secondary"
                        >
                          <svg
                            className="w-5 h-5 text-success mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link href="/auth/signup" className="btn btn-primary px-8">
                  {t("pricing.launchPhase.cta")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <PricingFuturePlans />

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {t("pricing.faq.title")}
            </h2>
            <p className="text-lg text-text-secondary">
              {t("pricing.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(translations.pricing.faq.questions).map(
              ([key, question]: [string, any]) => (
                <div
                  key={key}
                  className="rounded-xl shadow-sm border border-border bg-background p-6"
                >
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    {question.question}
                  </h3>
                  <p className="text-text-secondary">{question.answer}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
