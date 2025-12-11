"use client";
import React from "react";

export default function ProposalsTabs({
  activeTab,
  onChange,
  t,
}: {
  activeTab: "submitted" | "received";
  onChange: (tab: "submitted" | "received") => void;
  t: any;
}) {
  return (
    <div className="bg-background rounded-xl shadow-sm border border-border mb-4">
      <nav className="flex px-4">
        {["submitted", "received"].map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab as any)}
            className={`flex-1 py-3.5 font-semibold text-sm border-b-2 transition-all ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-primary"
            }`}
          >
            {t(`proposals.tabs.${tab}`)}
          </button>
        ))}
      </nav>
    </div>
  );
}
