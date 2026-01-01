"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/app/utils/theme";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export default function FAQAccordion({
  title,
  subtitle,
  items,
  className,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {(title || subtitle) && (
        <div className="text-center mb-12 sm:mb-16">
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 max-w-4xl mx-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-background-secondary overflow-hidden hover:border-primary/40 transition-all duration-200"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-expanded={openItems.includes(index)}
            >
              <h3 className="text-lg font-semibold text-text-primary pr-4">
                {item.question}
              </h3>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-text-secondary shrink-0 transition-transform duration-200",
                  openItems.includes(index) && "rotate-180"
                )}
              />
            </button>
            {openItems.includes(index) && (
              <div className="px-6 pb-4">
                <p className="text-text-secondary leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

