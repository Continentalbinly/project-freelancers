"use client";

import { useRouter } from "next/navigation";
import { useTranslationContext } from "../../LanguageProvider";

export default function FooterBottom() {
  const { t } = useTranslationContext();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-t border-border dark:border-gray-800 mt-10 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <button
            onClick={() => router.push("/privacy")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {t("footer.privacyPolicy")}
          </button>
          <button onClick={() => router.push("/terms")} className="hover:text-primary transition-colors cursor-pointer">
            {t("footer.termsOfService")}
          </button>
          <button
            onClick={() => router.push("/cookies")}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {t("footer.cookiePolicy")}
          </button>
        </div>

        <div className="text-center md:text-right">{t("footer.copyright").replace("{year}", currentYear.toString())}</div>
      </div>
    </div>
  );
}
