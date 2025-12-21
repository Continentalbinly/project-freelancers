"use client";

import Link from "next/link";
import SignupWizard from "./components/SignupWizard";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SignupPage() {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            {t("auth.signup.title") || "Get Started Today"}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary">
            {t("auth.signup.subtitle") || "Join our marketplace and start connecting"}
          </p>
        </div>

        {/* Wizard */}
        <SignupWizard />

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>
            {t("auth.signup.alreadyHaveAccount") || "Already have an account?"} {" "}
            <Link href="/auth/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              {t("auth.signup.signIn") || "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
