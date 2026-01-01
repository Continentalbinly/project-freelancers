"use client";
import { useRouter } from "next/navigation";
import Reveal from "@/app/components/motion/Reveal";
import MarketingContainer from "@/app/(page)/components/MarketingContainer";
import SearchBar from "./SearchBar";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  t: (key: string) => string;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const router = useRouter();
  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/20 py-20 sm:py-24 lg:py-28 overflow-hidden">
      {/* 🎨 Decorative background elements - Multiple layers for depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 dark:bg-secondary/15 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 dark:bg-success/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 dark:bg-primary/8 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-secondary/5 dark:bg-secondary/8 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Grid pattern overlay for subtle texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.07)_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] pointer-events-none"></div>

      <MarketingContainer>
        <div className="text-center flex flex-col items-center justify-center relative z-10">
          {/* 🎯 Headline */}
          <Reveal once={false}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              {t("landingPage.hero.title")}
            </h1>
          </Reveal>

          <Reveal delay={0.1} once={false}>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
              {t("landingPage.hero.subtitle")}
            </p>
          </Reveal>

          {/* 🔍 Search Bar */}
          <Reveal delay={0.2} once={false}>
            <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl">
              <SearchBar t={t} />
            </div>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.3} once={false}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 relative z-20">
              <button
                onClick={() => router.push("/auth/signup?type=freelancer")}
                className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("landingPage.hero.startEarning")}
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border-2 border-border bg-background text-text-primary hover:bg-background-secondary hover:border-primary/40 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("landingPage.hero.learnHow")}
              </a>
            </div>
          </Reveal>
        </div>
      </MarketingContainer>
    </section>
  );
}
