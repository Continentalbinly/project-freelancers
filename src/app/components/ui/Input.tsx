"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/utils/theme";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, fullWidth = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "px-4 py-3 border-2 rounded-lg bg-background text-text-primary transition-all duration-200",
          "focus:outline-none focus:ring-4 focus:ring-primary/10",
          error
            ? "border-error focus:border-error"
            : "border-border focus:border-primary",
          fullWidth && "w-full",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

