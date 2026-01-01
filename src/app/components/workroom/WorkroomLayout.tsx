"use client";

import { ReactNode } from "react";
import { cn } from "@/app/utils/theme";
import WorkroomHeader from "./WorkroomHeader";
import WorkroomSidebar from "./WorkroomSidebar";
import type { BreadcrumbItem } from "../ui/Breadcrumbs";

export interface WorkroomLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  sidebarContent?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export default function WorkroomLayout({
  title,
  subtitle,
  children,
  sidebarContent,
  breadcrumbs,
  className,
}: WorkroomLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <WorkroomHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary border border-border rounded-xl p-6 sm:p-8">
              {children}
            </div>
          </div>

          {/* Sidebar */}
          {sidebarContent && (
            <div className="lg:col-span-1">
              <WorkroomSidebar>{sidebarContent}</WorkroomSidebar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

