"use client";
import { useRouter } from "next/navigation";
import Reveal from "@/app/components/motion/Reveal";
import MarketingContainer from "@/app/(page)/components/MarketingContainer";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  t: (key: string) => string;
}

export default function CTASection({ t }: CTASectionProps) {
  const router = useRouter();
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-linear-to-r from-primary to-secondary dark:from-gray-800 dark:to-gray-700 overflow-hidden">
      {/* 🎨 Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-40 -mb-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <MarketingContainer className="relative z-10">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t("landingPage.cta.title")}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t("landingPage.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/auth/signup?type=freelancer")}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-200 text-primary hover:bg-gray-100 dark:hover:bg-gray-300 px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                {t("landingPage.cta.startAsFreelancer")}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/auth/signup?type=client")}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-200 text-secondary hover:bg-gray-100 dark:hover:bg-gray-300 px-8 py-4 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                {t("landingPage.cta.startAsClient")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </section>
  );
}
