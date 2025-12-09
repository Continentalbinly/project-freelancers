"use client";

import BackButton from "@/app/components/BackButton";

export default function ManageProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
