"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/service/firebase";
import {
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function VerifyEmailPage() {
  const { t } = useTranslationContext();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // ✅ Detect user and sync Firestore if verified
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setEmail(user.email || "");
      await user.reload(); // refresh latest status

      if (user.emailVerified) {
        try {
          // ✅ Update Firestore if still false
          const ref = doc(db, "profiles", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().emailVerified === false) {
            await updateDoc(ref, {
              emailVerified: true,
              updatedAt: new Date(),
            });
            console.log("✅ Firestore synced → emailVerified true");
          }
        } catch (err) {
          console.warn("⚠️ Firestore sync failed:", err);
        }

        router.push("/"); // redirect home
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Resend Verification Email (now includes displayName)
  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError(
        t("auth.verifyEmail.errors.noUser") || "No signed-in user found."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 🧩 Ensure Firebase Auth has displayName for %DISPLAY_NAME%
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.fullName && !user.displayName) {
          await updateProfile(user, { displayName: data.fullName });
          console.log(`✅ displayName set to: ${data.fullName}`);
        }
      }

      // 📧 Send verification email with correct displayName
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      });

      setMessage(
        t("auth.verifyEmail.success.sent") ||
          "Verification email sent successfully."
      );
    } catch (err: any) {
      console.error("❌ sendEmailVerification error:", err);
      setError(
        err.message ||
          t("auth.verifyEmail.errors.failedToSend") ||
          "Failed to send verification email."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-3" />
          <p className="text-text-secondary">
            {t("auth.verifyEmail.checking") || "Checking your email status..."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ UI for unverified users
  return (
    <div className="bg-white py-6 px-5 sm:py-8 sm:px-8 shadow-lg rounded-lg border border-border w-full max-w-md mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-primary"
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
          {t("auth.verifyEmail.title") || "Verify your email"}
        </h2>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          {t("auth.verifyEmail.subtitle") ||
            "Please verify your email to activate your account."}
        </p>
        {email && (
          <p className="text-primary font-medium text-sm sm:text-base truncate mt-1">
            {email}
          </p>
        )}
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
            {t("auth.verifyEmail.whatsNextTitle") || "What happens next?"}
          </h3>
          <ul className="text-xs sm:text-sm text-text-secondary space-y-1">
            <li>
              •{" "}
              {t("auth.verifyEmail.steps.checkInbox") ||
                "Check your inbox or spam folder."}
            </li>
            <li>
              •{" "}
              {t("auth.verifyEmail.steps.clickLink") ||
                "Click the verification link we sent."}
            </li>
            <li>
              •{" "}
              {t("auth.verifyEmail.steps.returnToLogin") ||
                "After verifying, you can return and sign in."}
            </li>
          </ul>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full btn btn-outline py-2 sm:py-3 text-sm sm:text-base"
          >
            {loading
              ? t("auth.verifyEmail.buttons.sending") || "Sending..."
              : t("auth.verifyEmail.buttons.resend") ||
                "Resend Verification Email"}
          </button>

          <Link
            href="/"
            className="w-full inline-block text-center btn btn-secondary py-2 sm:py-3 text-sm sm:text-base"
          >
            {t("auth.verifyEmail.buttons.goHome") || "Go Home"}
          </Link>

          <div className="text-center">
            <p className="text-text-secondary text-sm sm:text-base">
              {t("auth.verifyEmail.alreadyVerified") || "Already verified?"}{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary-hover font-medium"
              >
                {t("auth.verifyEmail.signIn") || "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
