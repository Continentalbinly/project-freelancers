"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SubscribePageLAK() {
  const { t } = useTranslationContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-secondary">{t("common.loading") || "Loading..."}</p>
      </div>
    );

  return (
    <div className="bg-background text-text-primary min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-linear-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {t("pricing.blockedFeature.title")}
          </h1>
        </div>
      </section>

      {/* Blocked Message */}
      <section className="py-10 sm:py-14">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-border bg-background rounded-2xl p-6 sm:p-8 shadow-md text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⏳</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-4">
              {t("pricing.blockedFeature.title")}
            </h2>

            <p className="text-text-secondary mb-6 text-lg">
              {t("pricing.blockedFeature.message")}
            </p>

            <p className="text-sm text-text-secondary mb-8 bg-background-secondary p-4 rounded-lg">
              {t("pricing.blockedFeature.availableNote")}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Link href="/pricing" className="btn btn-primary px-8">
                {t("pricing.blockedFeature.backButton")}
              </Link>
              <Link href="/contact" className="btn btn-outline px-8">
                💬 {t("pay.buttons.contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
