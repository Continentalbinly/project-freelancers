"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/service/firebase";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function VerifyEmailPage() {
  const { t } = useTranslationContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setEmail(user.email || "");
    });
    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      setError(t("auth.verifyEmail.errors.noUser"));
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      });
      setMessage(t("auth.verifyEmail.success.sent"));
    } catch (err: any) {
      setError(err.message || t("auth.verifyEmail.errors.failedToSend"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-6 px-5 sm:py-8 sm:px-8 shadow-lg rounded-lg border border-border w-full max-w-md mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          {t("auth.verifyEmail.title")}
        </h2>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          {t("auth.verifyEmail.subtitle")}
        </p>
        <p className="text-primary font-medium text-sm sm:text-base truncate mt-1">
          {email}
        </p>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        <div className="bg-primary-light/10 p-4 rounded-md">
          <h3 className="font-medium text-primary mb-2 text-sm sm:text-base">
            {t("auth.verifyEmail.whatsNextTitle")}
          </h3>
          <ul className="text-xs sm:text-sm text-text-secondary space-y-1">
            <li>• {t("auth.verifyEmail.steps.checkInbox")}</li>
            <li>• {t("auth.verifyEmail.steps.clickLink")}</li>
            <li>• {t("auth.verifyEmail.steps.returnToLogin")}</li>
          </ul>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            suppressHydrationWarning
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full btn btn-outline py-2 sm:py-3 text-sm sm:text-base"
          >
            {loading
              ? t("auth.verifyEmail.buttons.sending")
              : t("auth.verifyEmail.buttons.resend")}
          </button>

          <Link
            href="/"
            className="w-full inline-block text-center btn btn-secondary py-2 sm:py-3 text-sm sm:text-base"
          >
            {t("auth.verifyEmail.buttons.goHome")}
          </Link>

          <div className="text-center">
            <p className="text-text-secondary text-sm sm:text-base">
              {t("auth.verifyEmail.alreadyVerified")}{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary-hover font-medium"
              >
                {t("auth.verifyEmail.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
