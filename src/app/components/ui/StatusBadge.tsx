"use client";

import { getStatusConfig, getStatusLabel } from "@/app/lib/workflow/status";
import type { ProjectStatus, OrderStatus } from "@/app/lib/workflow/status";
import { useTranslationContext } from "../LanguageProvider";
import { cn } from "@/app/utils/theme";

export interface StatusBadgeProps {
  status: ProjectStatus | OrderStatus;
  type: "project" | "order";
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  type,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const { currentLanguage } = useTranslationContext();
  const config = getStatusConfig(status, type);
  const label = getStatusLabel(status, currentLanguage as "en" | "lo", type);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && config.icon && (
        <span className="flex-shrink-0">{config.icon}</span>
      )}
      <span>{label}</span>
    </span>
  );
}

