"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/utils/theme";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const baseStyles = "rounded-xl transition-all duration-200";

    const variants = {
      default: "bg-background-secondary border border-border",
      outlined: "bg-background border-2 border-border",
      elevated: "bg-background shadow-md border border-border",
    };

    const hoverStyles = hover
      ? "hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
      : "";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

