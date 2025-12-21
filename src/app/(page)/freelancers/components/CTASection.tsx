"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useRouter } from "next/navigation";

export default function CTASection() {
  const { t } = useTranslationContext();
  const router = useRouter();

  return (
    <section className="py-20 bg-gradient-to-r from-primary via-primary to-primary-hover relative overflow-hidden text-center text-white">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-40"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          {t("freelancersPage.cta.title")}
        </h2>
        <p className="text-lg sm:text-xl text-white/90 mb-8">
          {t("freelancersPage.cta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push("/auth/signup?type=freelancer")}
            className="btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg cursor-pointer"
          >
            {t("freelancersPage.cta.createProfile")}
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold shadow-lg cursor-pointer"
          >
            {t("freelancersPage.cta.browseProjects")}
          </button>
        </div>
      </div>
    </section>
  );
}
