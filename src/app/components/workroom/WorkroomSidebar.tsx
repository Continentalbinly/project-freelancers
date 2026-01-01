"use client";

import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";

export interface WorkroomSidebarProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export default function WorkroomSidebar({
  children,
  className,
  sticky = true,
}: WorkroomSidebarProps) {
  return (
    <div
      className={cn(
        "bg-background-secondary border border-border rounded-xl p-6",
        sticky && "lg:sticky lg:top-6",
        className
      )}
    >
      {children}
    </div>
  );
}

