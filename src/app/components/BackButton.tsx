"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition cursor-pointer"
    >
      <ChevronLeft className="w-5 h-5" />
      {label}
    </button>
  );
}
