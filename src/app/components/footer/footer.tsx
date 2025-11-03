"use client";

import FooterSection from "./components/FooterSection";
import FooterSocial from "./components/FooterSocial";
import FooterBottom from "./components/FooterBottom";
import { useTranslationContext } from "../LanguageProvider";

export default function Footer() {
  const { t } = useTranslationContext();

  const sections = [
    {
      title: t("footer.platform"),
      links: [
        { href: "/projects", label: t("footer.browseProjects") },
        { href: "/freelancers", label: t("footer.findFreelancers") },
        { href: "/clients", label: t("footer.forClients") },
        { href: "/how-it-works", label: t("footer.howItWorks") },
        { href: "/pricing", label: t("footer.pricing") },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { href: "/help", label: t("footer.helpCenter") },
        { href: "/contact", label: t("footer.contactUs") },
        { href: "/faq", label: t("footer.faq") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("footer.aboutUs") },
        { href: "/careers", label: t("footer.careers") },
      ],
    },
  ];

  return (
    <footer className="bg-background-secondary border-t border-border pt-10 md:pt-16 pb-[6rem] md:pb-12 relative z-10">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Social */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <img
              src="/favicon.svg"
              alt="UniJobs logo"
              width={70}
              height={70}
              className="rounded-md"
            />
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            {t("footer.companyDescription")}
          </p>
          <FooterSocial />
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <FooterSection
            key={section.title}
            title={section.title}
            links={section.links}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <FooterBottom />
    </footer>
  );
}
