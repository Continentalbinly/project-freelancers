"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Tag, ChevronLeft } from "lucide-react";

export default function CategoriesHeader() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 hover:text-primary transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Tag className="w-5 h-5" /> Categories
          </h1>
        </div>
      </div>
    </header>
  );
}
