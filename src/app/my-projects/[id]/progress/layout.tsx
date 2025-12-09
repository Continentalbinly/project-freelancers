"use client";

import BackButton from "@/app/components/BackButton";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton />
      <div>{children}</div>
    </div>
  );
}
