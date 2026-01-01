import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";

interface MarketingContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MarketingContainer({
  children,
  className,
}: MarketingContainerProps) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

