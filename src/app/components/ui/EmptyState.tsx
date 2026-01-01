"use client";

import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center px-6",
        className
      )}
    >
      {icon && (
        <div className="mb-6 text-text-secondary/50">{icon}</div>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || "primary"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

