"use client";

import {
  languages,
  supportedLanguages,
  defaultLanguage,
  Language,
} from "@/lib/i18n/config";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslationContext } from "./LanguageProvider";

function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentLanguage, changeLanguage } = useTranslationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  // Reorder languages to show Lao first
  const orderedLanguages: Language[] = ["lo", "en"];

  const getFlagImage = (lang: Language) => {
    switch (lang) {
      case "lo":
        return "/images/assets/laos.png";
      case "en":
        return "/images/assets/usa.png";
      default:
        return "/images/assets/usa.png";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-background-secondary border border-border rounded-lg hover:bg-background transition-colors"
      >
        <img
          src={getFlagImage(currentLanguage)}
          alt={`${languages[currentLanguage].nativeName} flag`}
          width={20}
          height={15}
          className="rounded-sm"
        />
        <span className="text-sm text-text-primary">
          {languages[currentLanguage].nativeName}
        </span>
        <svg
          className={`w-4 h-4 text-text-secondary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
          {orderedLanguages.map((lang) => (
            <button
              suppressHydrationWarning
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background-secondary transition-colors ${
                currentLanguage === lang
                  ? "bg-primary/10 text-primary"
                  : "text-text-primary"
              }`}
            >
              <img
                src={getFlagImage(lang)}
                alt={`${languages[lang].nativeName} flag`}
                width={20}
                height={15}
                className="rounded-sm"
              />
              <span className="text-sm">{languages[lang].nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { t } = useTranslationContext();
  const [expandedSections, setExpandedSections] = useState<{
    platform: boolean;
    support: boolean;
    company: boolean;
  }>({
    platform: false,
    support: false,
    company: false,
  });

  const toggleSection = (section: "platform" | "support" | "company") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-background-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/favicon.svg"
                alt="UniJobs logo"
                width={80}
                height={80}
                className="rounded-md"
              />
            </div>
            <p className="text-text-secondary mb-4">
              {t("footer.companyDescription")}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-1">
            <div className="md:hidden">
              <button
                suppressHydrationWarning
                onClick={() => toggleSection("platform")}
                className="flex items-center justify-between w-full text-left font-semibold text-text-primary mb-4"
              >
                {t("footer.platform")}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.platform ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <h3 className="hidden md:block font-semibold text-text-primary mb-4">
              {t("footer.platform")}
            </h3>
            <div
              className={`md:block ${
                expandedSections.platform ? "block" : "hidden"
              }`}
            >
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/projects"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.browseProjects")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/freelancers"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.findFreelancers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/clients"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.forClients")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.howItWorks")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.pricing")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-1">
            <div className="md:hidden">
              <button
                suppressHydrationWarning
                onClick={() => toggleSection("support")}
                className="flex items-center justify-between w-full text-left font-semibold text-text-primary mb-4"
              >
                {t("footer.support")}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.support ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <h3 className="hidden md:block font-semibold text-text-primary mb-4">
              {t("footer.support")}
            </h3>
            <div
              className={`md:block ${
                expandedSections.support ? "block" : "hidden"
              }`}
            >
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.helpCenter")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.contactUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.faq")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1">
            <div className="md:hidden">
              <button
                suppressHydrationWarning
                onClick={() => toggleSection("company")}
                className="flex items-center justify-between w-full text-left font-semibold text-text-primary mb-4"
              >
                {t("footer.company")}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.company ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <h3 className="hidden md:block font-semibold text-text-primary mb-4">
              {t("footer.company")}
            </h3>
            <div
              className={`md:block ${
                expandedSections.company ? "block" : "hidden"
              }`}
            >
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-text-secondary hover:text-primary transition-colors"
                  >
                    {t("footer.careers")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-text-secondary">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                {t("footer.termsOfService")}
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                {t("footer.cookiePolicy")}
              </Link>
            </div>
            <div className="text-sm text-text-secondary">
              {t("footer.copyright")}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
