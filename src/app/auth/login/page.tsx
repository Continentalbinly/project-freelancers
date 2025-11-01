"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "@/service/auth-client";
import { LoginCredentials } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

/* 🌐 Helper: extract short Firebase error key */
function getErrorKey(rawCode: string): string {
  let code = rawCode?.toLowerCase().trim();

  if (code.startsWith("firebase: error (") && code.endsWith(").")) {
    code = code.slice(16, -2); // → "auth/invalid-credential"
  }

  // extract "invalid-credential" part
  const match = code.match(/auth\/(.+)/);
  return match ? match[1] : "unknown";
}

export default function LoginPage() {
  const { t } = useTranslationContext();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string>("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorKey("");

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success) {
        router.push("/");
      } else {
        const code =
          result.errorCode ||
          (result.error?.includes("auth/") ? result.error : "auth/unknown");
        setErrorKey(getErrorKey(code));
      }
    } catch (err: any) {
      const code =
        err?.code ||
        (err?.message?.includes("auth/") ? err.message : "auth/unknown");
      setErrorKey(getErrorKey(code));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  if (user) {
    return (
      <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg rounded-lg border border-border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-secondary">
            {t("auth.login.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full">
      <div className="text-center mb-4 sm:mb-6">
        <Link href="/" className="flex justify-center mb-3">
          <Image
            src="/favicon.svg"
            alt="UniJobs logo"
            width={120}
            height={120}
            className="rounded-md"
            priority
          />
        </Link>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">
          {t("auth.login.title")}
        </h2>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 sm:space-y-4 lg:space-y-6"
      >
        {errorKey && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm sm:text-base">
            {t(`auth.login.error.${errorKey}`)}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {t("auth.login.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("auth.login.emailPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {t("auth.login.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t("auth.login.passwordPlaceholder")}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-text-secondary"
            >
              {t("auth.login.rememberMe")}
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary-hover"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-2 sm:py-3 text-sm sm:text-base font-medium"
        >
          {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
        </button>
      </form>

      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-text-secondary text-sm sm:text-base">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary-hover font-medium"
          >
            {t("auth.login.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
