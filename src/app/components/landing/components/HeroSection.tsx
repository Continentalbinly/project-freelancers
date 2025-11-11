import Link from "next/link";
import SearchBar from "./SearchBar";

export default function HeroSection({ t }: any) {
  return (
    <section className="relative bg-gradient-to-br from-primary-light to-secondary-light py-20 sm:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* 🎯 Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight drop-shadow-sm">
          {t("landingPage.hero.title")}
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-10 max-w-4xl mx-auto leading-relaxed">
          {t("landingPage.hero.subtitle")}
        </p>

        {/* 🔍 Search Bar */}
        <SearchBar t={t} />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/auth/signup?type=freelancer"
            className="btn btn-primary px-8 py-4 text-lg"
          >
            {t("landingPage.hero.startEarning")}
          </Link>
          <Link
            href="/how-it-works"
            className="btn btn-outline px-8 py-4 text-lg"
          >
            {t("landingPage.hero.learnHow")}
          </Link>
        </div>
      </div>

      {/* 🌤️ Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none"></div>
    </section>
  );
}
