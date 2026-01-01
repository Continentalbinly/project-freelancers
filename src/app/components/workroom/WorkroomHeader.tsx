"use client";

import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";
import Breadcrumbs, { type BreadcrumbItem } from "../ui/Breadcrumbs";

export interface WorkroomHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export default function WorkroomHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: WorkroomHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

