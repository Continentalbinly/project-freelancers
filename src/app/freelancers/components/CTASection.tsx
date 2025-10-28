"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import Link from "next/link";

export default function CTASection() {
  const { t } = useTranslationContext();

  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-center text-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          {t("freelancersPage.cta.title")}
        </h2>
        <p className="text-lg sm:text-xl text-white/90 mb-8">
          {t("freelancersPage.cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/auth/signup?type=freelancer"
            className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
          >
            {t("freelancersPage.cta.createProfile")}
          </Link>
          <Link
            href="/projects"
            className="btn btn-outline border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg"
          >
            {t("freelancersPage.cta.browseProjects")}
          </Link>
        </div>
      </div>
    </section>
  );
}
