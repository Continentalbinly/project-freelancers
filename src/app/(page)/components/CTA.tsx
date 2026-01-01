"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/app/utils/theme";

interface CTAProps {
  title: string;
  subtitle?: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  variant?: "gradient" | "solid";
  className?: string;
  children?: React.ReactNode;
}

export default function CTA({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
  variant = "gradient",
  className,
  children,
}: CTAProps) {
  return (
    <section
      className={cn(
        "py-12 sm:py-16 lg:py-20 relative",
        variant === "gradient"
          ? "bg-linear-to-r from-primary to-secondary"
          : "bg-background-secondary",
        className
      )}
    >
      {children}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h2
          className={cn(
            "text-3xl sm:text-4xl font-bold mb-6",
            variant === "gradient" ? "text-white" : "text-text-primary"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "text-xl mb-8",
              variant === "gradient"
                ? "text-white/90"
                : "text-text-secondary"
            )}
          >
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryCTA.href}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              variant === "gradient"
                ? "bg-white text-primary hover:bg-gray-100 focus-visible:ring-white"
                : "bg-primary text-white hover:bg-primary-hover hover:shadow-primary/30 focus-visible:ring-primary"
            )}
          >
            {primaryCTA.label}
            <ArrowRight className="w-5 h-5" />
          </Link>
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className={cn(
                "inline-flex items-center gap-2 border-2 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                variant === "gradient"
                  ? "border-white text-white hover:bg-white/10 focus-visible:ring-white"
                  : "border-border bg-background text-text-primary hover:bg-background-secondary hover:border-primary/40 focus-visible:ring-primary"
              )}
            >
              {secondaryCTA.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

