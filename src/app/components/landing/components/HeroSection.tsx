"use client";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";

interface HeroSectionProps {
  t: (key: string) => string;
}

export default function HeroSection({ t }: HeroSectionProps) {
  const router = useRouter();
  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/20 py-20 sm:py-24 lg:py-28 overflow-hidden">
      {/* 🎨 Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl -ml-40 -mb-40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center relative z-10">
        {/* 🎯 Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {t("landingPage.hero.title")}
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
          {t("landingPage.hero.subtitle")}
        </p>

        {/* 🔍 Search Bar */}
        <SearchBar t={t} />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 relative z-20">
          <button
            onClick={() => router.push("/auth/signup?type=freelancer")}
            className="btn btn-primary px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            {t("landingPage.hero.startEarning")}
          </button>
          <button
            onClick={() => router.push("/how-it-works")}
            className="btn btn-outline px-8 py-4 text-lg font-semibold hover:shadow-lg transition-all duration-300 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            {t("landingPage.hero.learnHow")}
          </button>
        </div>
      </div>
    </section>
  );
}
