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
        bg-background-secondary/95 backdrop-blur-lg
        border border-border shadow-md
        rounded-full
        w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl
        mx-auto
        h-12 sm:h-14
        px-4 sm:px-6
        transition-all duration-200
        focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
        focus-within:border-primary/40 focus-within:shadow-lg
      "
    >
      <Search className="text-text-secondary w-5 h-5 sm:w-6 sm:h-6 shrink-0" />

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
          placeholder:text-text-secondary/60 dark:placeholder:text-text-secondary/60
          text-text-primary dark:text-text-primary
        "
        aria-label="Search for projects"
      />

      <button
        type="submit"
        disabled={!query.trim()}
        className="
          bg-primary text-white font-semibold
          rounded-full transition-all duration-200
          px-5 sm:px-7
          h-8 sm:h-9
          text-sm sm:text-base
          hover:bg-primary-hover hover:shadow-md hover:shadow-primary/30
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          shrink-0
        "
        aria-label="Search"
      >
        {t("landingPage.hero.searchButton") || "Search"}
      </button>
    </form>
  );
}
