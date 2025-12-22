"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  t: (key: string) => string;
}

export default function SearchBar({ t }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/projects?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        flex items-center justify-between
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg
        border border-gray-200 dark:border-gray-700 shadow-md
        rounded-full
        w-[95%] sm:w-[85%] md:w-[75%] lg:w-[70%] xl:w-[60%] 2xl:w-[55%]
        mx-auto mt-8
        px-3 sm:px-6 py-2 sm:py-3
        transition-all duration-200
        focus-within:ring-2 focus-within:ring-primary
      "
    >
      <Search className="text-gray-500 dark:text-gray-400 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          t("landingPage.hero.searchPlaceholder") ||
          "Search for jobs, projects, or skills..."
        }
        className="
          flex-1 bg-transparent border-none outline-none
          text-sm sm:text-base lg:text-lg
          px-3 sm:px-4
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          text-text-primary dark:text-gray-100
        "
      />

      <button
        type="submit"
        disabled={!query.trim()}
        className="
          bg-primary text-white font-medium
          rounded-full transition-all duration-200
          px-4 sm:px-6 py-1.5 sm:py-2
          text-sm sm:text-base
          hover:bg-primary/90 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {t("landingPage.hero.searchButton") || "Search"}
      </button>
    </form>
  );
}
