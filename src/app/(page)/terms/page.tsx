"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  const { t, currentLanguage } = useTranslationContext();

  // Get the current translations object
  const translations = currentLanguage === "lo" ? lo : en;

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("termsPage.title")}
        subtitle={t("termsPage.lastUpdated")}
      />

      {/* Content */}
      <MarketingSection>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("header.home")}
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-background-secondary p-6 sm:p-8">
            <div className="space-y-8">
              {/* Acceptance of Terms */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.acceptance.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.acceptance.content")}
                </p>
              </section>

              {/* Description of Service */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.description.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.description.content")}
                </p>
              </section>

              {/* User Accounts */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.userAccounts.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.userAccounts.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.userAccounts.items.map(
                    (item: string, index: number) => (
                      <p key={index}>
                        {index + 1}. {item}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.userResponsibilities.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.userResponsibilities.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.userResponsibilities.items.map(
                    (
                      item: { role: string; description: string },
                      index: number
                    ) => (
                      <p key={index}>
                        <strong>{item.role}</strong> {item.description}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Payment and Fees */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.paymentAndFees.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.paymentAndFees.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.paymentAndFees.items.map(
                    (item: string, index: number) => (
                      <p key={index}>
                        {index + 1}. {item}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.intellectualProperty.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.intellectualProperty.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.intellectualProperty.items.map(
                    (item: string, index: number) => (
                      <p key={index}>
                        {index + 1}. {item}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.disputeResolution.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.disputeResolution.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.disputeResolution.items.map(
                    (item: string, index: number) => (
                      <p key={index}>
                        {index + 1}. {item}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.limitationOfLiability.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.limitationOfLiability.content")}
                </p>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.termination.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.termination.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.termsPage.sections.termination.items.map(
                    (item: string, index: number) => (
                      <p key={index}>
                        {index + 1}. {item}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.changesToTerms.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.changesToTerms.content")}
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("termsPage.sections.contactInformation.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("termsPage.sections.contactInformation.content")}{" "}
                  <a
                    href={`mailto:${t("termsPage.sections.contactInformation.email")}`}
                    className="text-primary hover:text-primary-hover underline transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {t("termsPage.sections.contactInformation.email")}
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </MarketingSection>
    </MarketingLayout>
  );
}
