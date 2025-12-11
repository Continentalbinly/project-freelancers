"use client";

import Link from "next/link";
import { useTranslationContext } from "../../LanguageProvider";

export default function FooterBottom() {
  const { t } = useTranslationContext();

  return (
    <div className="border-t border-border dark:border-gray-800 mt-10 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <Link
            href="/privacy"
            className="hover:text-primary transition-colors"
          >
            {t("footer.privacyPolicy")}
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            {t("footer.termsOfService")}
          </Link>
          <Link
            href="/cookies"
            className="hover:text-primary transition-colors"
          >
            {t("footer.cookiePolicy")}
          </Link>
        </div>

        <div className="text-center md:text-right">{t("footer.copyright")}</div>
      </div>
    </div>
  );
}
