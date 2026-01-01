"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { cn } from "@/app/utils/theme";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        "flex gap-2 border-b border-border overflow-x-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  count?: number;
  className?: string;
}

export function TabsTrigger({
  value,
  children,
  count,
  className,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 sm:px-6 py-2.5 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-all whitespace-nowrap",
        isActive
          ? "bg-background text-primary border-b-2 border-primary shadow-sm"
          : "text-text-secondary hover:text-primary",
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "ml-2 px-2 py-0.5 rounded-full text-xs",
            isActive
              ? "bg-primary/10 text-primary"
              : "bg-background-tertiary text-text-secondary"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const { activeTab } = context;
  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
}

