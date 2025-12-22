"use client";

import { useState, useEffect } from "react";
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
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      // If user is already logged in, redirect based on role
      // This handles cases where user navigates to login while already authenticated
      if (profile.role === "client") {
        router.replace("/gigs");
      } else if (profile.role === "freelancer") {
        router.replace("/projects");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorKey("");

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success && result.user) {
        // ✅ Redirect directly to role-specific pages (no intermediate loading)
        const role = result.user.role;
        if (role === "client") {
          router.replace("/gigs");
        } else if (role === "freelancer") {
          router.replace("/projects");
        } else {
          router.replace("/dashboard");
        }
        // Don't set loading to false - let the redirect happen
        return;
      } else {
        const code =
          result.errorCode ||
          (result.error?.includes("auth/") ? result.error : "auth/unknown");
        setErrorKey(getErrorKey(code));
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code ||
        (errorObj?.message?.includes("auth/") ? errorObj.message : "auth/unknown");
      setErrorKey(getErrorKey(code));
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // Skeleton Component (matches gigs page structure)
  function GigSkeleton() {
    return (
      <div className="border border-border rounded-xl overflow-hidden bg-background-secondary dark:bg-gray-800 animate-pulse">
        {/* Cover Image */}
        <div className="h-40 bg-background-tertiary dark:bg-gray-700"></div>
        <div className="p-4 space-y-3">
          {/* Owner Info Skeleton */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <div className="w-6 h-6 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
            <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded"></div>
          </div>
          
          {/* Title & Category */}
          <div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-16"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-14"></div>
          </div>
          
          {/* Price & Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
            <div className="h-7 bg-background-tertiary dark:bg-gray-700 rounded-lg w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-9 bg-background-secondary dark:bg-gray-800 rounded-lg w-48 mb-2"></div>
            <div className="h-5 bg-background-secondary dark:bg-gray-800 rounded w-96"></div>
          </div>

          {/* Search Bar & Filters Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 animate-pulse">
            <div className="flex-1 h-12 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
            <div className="h-12 w-32 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
          </div>

          {/* Category Filters Skeleton */}
          <div className="mb-6 flex flex-wrap gap-2 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>

          {/* Gigs Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <GigSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto flex items-center justify-center">
      <div className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-2xl border border-border bg-background w-full max-w-md mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <button onClick={() => router.push("/")} className="flex justify-center mb-3 mx-auto cursor-pointer">
            <Image
              src="/favicon.svg"
              alt="UniJobs logo"
              width={120}
              height={120}
              className="rounded-md"
              priority
            />
          </button>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold  ">
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
              className="block text-sm font-medium   mb-2"
            >
              {t("auth.login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              suppressHydrationWarning
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("auth.login.emailPlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium   mb-2"
            >
              {t("auth.login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              suppressHydrationWarning
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t("auth.login.passwordPlaceholder")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center">
              <input
                suppressHydrationWarning
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
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-primary hover:text-primary-hover cursor-pointer"
            >
              {t("auth.login.forgotPassword")}
            </button>
          </div>

          <button
            suppressHydrationWarning
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
            <button
              onClick={() => router.push("/auth/signup")}
              className="text-primary hover:text-primary-hover font-medium cursor-pointer"
            >
              {t("auth.login.signUp")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
