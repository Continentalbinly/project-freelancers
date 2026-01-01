"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { ArrowRight } from "lucide-react";
import { cn } from "@/app/utils/theme";

interface MarketingHeroProps {
  title: string;
  subtitle?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export default function MarketingHero({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  className,
  children,
}: MarketingHeroProps) {
  const { t } = useTranslationContext();

  return (
    <section
      className={cn(
        "bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/20 py-12 sm:py-16 lg:py-20 relative overflow-hidden",
        className
      )}
    >
      {/* 🎨 Decorative background elements - Multiple layers for depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 dark:bg-secondary/15 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 dark:bg-success/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/5 dark:bg-primary/8 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-secondary/5 dark:bg-secondary/8 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Grid pattern overlay for subtle texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.07)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] pointer-events-none"></div>
      
      {children}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {subtitle}
            </p>
          )}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {primaryCTA && (
                <Link
                  href={primaryCTA.href}
                  className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {primaryCTA.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className="inline-flex items-center gap-2 border-2 border-border bg-background text-text-primary hover:bg-background-secondary hover:border-primary/40 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

