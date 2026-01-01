"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SignupWizard from "./components/SignupWizard";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import Reveal from "@/app/components/motion/Reveal";

export default function SignupPage() {
  const { t } = useTranslationContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Reveal once={false}>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2" suppressHydrationWarning>
            {mounted ? (t("auth.signup.title") || "Get Started Today") : "Get Started Today"}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary dark:text-gray-300" suppressHydrationWarning>
            {mounted ? (t("auth.signup.subtitle") || "Join our marketplace and start connecting") : "Join our marketplace and start connecting"}
          </p>
        </div>

        {/* Wizard */}
        <SignupWizard />

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center pt-6 border-t border-border/60 dark:border-gray-700/60">
          <p className="text-sm text-text-secondary dark:text-gray-300" suppressHydrationWarning>
            {mounted ? (t("auth.signup.alreadyHaveAccount") || "Already have an account?") : "Already have an account?"}{" "}
            <Link 
              href="/auth/login" 
              className="text-primary hover:text-primary-hover font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              {mounted ? (t("auth.signup.signIn") || "Sign in") : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </Reveal>
  );
}
