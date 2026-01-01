"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
  const { t, currentLanguage } = useTranslationContext();

  // Get the current translations object
  const translations = currentLanguage === "lo" ? lo : en;

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("cookiePolicy.title")}
        subtitle={t("cookiePolicy.lastUpdated")}
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
              {/* What Are Cookies */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.whatAreCookies.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.whatAreCookies.content")}
                </p>
              </section>

              {/* How We Use Cookies */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.howWeUseCookies.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.howWeUseCookies.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  {translations.cookiePolicy.sections.howWeUseCookies.items.map(
                    (
                      item: { type: string; description: string },
                      index: number
                    ) => (
                      <p key={index}>
                        <strong>{item.type}</strong> {item.description}
                      </p>
                    )
                  )}
                </div>
              </section>

              {/* Types of Cookies */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.typesOfCookies.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.typesOfCookies.content")}
                </p>
                <div className="space-y-6">
                  {translations.cookiePolicy.sections.typesOfCookies.items.map(
                    (
                      item: { title: string; description: string },
                      index: number
                    ) => (
                      <div key={index}>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          {item.title}
                        </h3>
                        <p className="text-base text-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Specific Cookies */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.specificCookies.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.specificCookies.content")}
                </p>
                <div className="space-y-4">
                  {translations.cookiePolicy.sections.specificCookies.items.map(
                    (
                      item: { title: string; description: string },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-border bg-background"
                      >
                        <h4 className="font-semibold text-text-primary mb-2">
                          {item.title}
                        </h4>
                        <p className="text-base text-text-secondary">
                          {item.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* Managing Cookies */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.managingCookies.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.managingCookies.content")}
                </p>
                <div className="space-y-4 text-text-secondary">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {translations.cookiePolicy.sections.managingCookies.items.map(
                      (
                        item: { method: string; description: string },
                        index: number
                      ) => (
                        <li key={index}>
                          <strong>{item.method}</strong> {item.description}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </section>

              {/* Impact of Disabling */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.impactOfDisabling.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.impactOfDisabling.content")}
                </p>
              </section>

              {/* Updates to Policy */}
              <section className="border-b border-border pb-8 last:border-b-0">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.updatesToPolicy.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.updatesToPolicy.content")}
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">
                  {t("cookiePolicy.sections.contactUs.title")}
                </h2>
                <p className="text-base text-text-secondary leading-relaxed mb-4">
                  {t("cookiePolicy.sections.contactUs.content")}{" "}
                  <a
                    href={`mailto:${t("cookiePolicy.sections.contactUs.email")}`}
                    className="text-primary hover:text-primary-hover underline transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {t("cookiePolicy.sections.contactUs.email")}
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
