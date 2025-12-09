"use client";

import BackButton from "@/app/components/BackButton";

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Simple universal back button */}
      <BackButton />

      <div>{children}</div>
    </div>
  );
}
