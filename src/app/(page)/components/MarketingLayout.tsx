"use client";

import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";

interface MarketingLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function MarketingLayout({
  children,
  className,
}: MarketingLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

