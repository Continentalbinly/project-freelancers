import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";
import MarketingContainer from "./MarketingContainer";

interface MarketingSectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
  background?: "default" | "secondary";
}

export default function MarketingSection({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  align = "center",
  className,
  background = "default",
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 md:py-16 relative overflow-hidden",
        background === "secondary" ? "bg-background-secondary" : "bg-background",
        className
      )}
    >
      {/* 🎨 Subtle background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/3 dark:bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/3 dark:bg-secondary/5 rounded-full blur-3xl -ml-28 -mb-28"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success/2 dark:bg-success/4 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] pointer-events-none"></div>
      
      <MarketingContainer className="relative z-10">
        {(eyebrow || title || subtitle) && (
          <div
            className={cn(
              "mb-8 md:mb-12",
              align === "center" ? "text-center" : "text-left"
            )}
          >
            {eyebrow && (
              <p className="text-sm uppercase tracking-wide text-text-secondary mb-2">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </MarketingContainer>
    </section>
  );
}

