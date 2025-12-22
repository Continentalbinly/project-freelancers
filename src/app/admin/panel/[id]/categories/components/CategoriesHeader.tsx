"use client";

import { useRouter } from "next/navigation";
import { Tag, ChevronLeft } from "lucide-react";

export default function CategoriesHeader() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 supports-backdrop-filter:backdrop-blur-sm border-b border-border shadow-sm bg-background">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-text-secondary hover:text-primary transition-all duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md p-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" /> Categories
          </h1>
        </div>
      </div>
    </header>
  );
}
