"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "@/service/auth-client";
import { LoginCredentials } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Reveal from "@/app/components/motion/Reveal";

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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

  // Prevent hydration mismatch by only rendering translated content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && profile) {
      // If user is already logged in, redirect based on role
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
        // ✅ Redirect directly to role-specific pages
        const role = result.user.role;
        if (role === "client") {
          router.replace("/gigs");
        } else if (role === "freelancer") {
          router.replace("/projects");
        } else {
          router.replace("/dashboard");
        }
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
        <div className="h-40 bg-background-tertiary dark:bg-gray-700"></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <div className="w-6 h-6 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
            <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded"></div>
          </div>
          <div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-16"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-14"></div>
          </div>
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
          <div className="mb-8 animate-pulse">
            <div className="h-9 bg-background-secondary dark:bg-gray-800 rounded-lg w-48 mb-2"></div>
            <div className="h-5 bg-background-secondary dark:bg-gray-800 rounded w-96"></div>
          </div>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 animate-pulse">
            <div className="flex-1 h-12 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
            <div className="h-12 w-32 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="mb-6 flex flex-wrap gap-2 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
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
    <Reveal once={false}>
      <div className="w-full">
        <div className="rounded-2xl border border-border dark:border-gray-700/50 bg-background-secondary/95 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl dark:shadow-2xl dark:shadow-gray-900/50 p-6 sm:p-8 lg:p-10">
            {/* Logo and Header */}
            <div className="text-center mb-6 sm:mb-8">
              <button
                onClick={() => router.push("/")}
                className="flex justify-center mb-4 mx-auto cursor-pointer transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              >
                <Image
                  src="/favicon.svg"
                  alt="UniJobs logo"
                  width={100}
                  height={100}
                  className="rounded-lg"
                  priority
                />
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2" suppressHydrationWarning>
                {mounted ? t("auth.login.title") : "Login"}
              </h1>
              <p className="text-base text-text-secondary dark:text-gray-300" suppressHydrationWarning>
                {mounted ? t("auth.login.subtitle") : "Sign in to your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Error Message */}
              {errorKey && (
                <div className="flex items-start gap-3 bg-error/10 dark:bg-error/20 border border-error/20 dark:border-error/30 text-error dark:text-error px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p suppressHydrationWarning>{mounted ? (t(`auth.login.error.${errorKey}`) || t("auth.login.errors.loginFailed")) : "Login failed"}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-text-primary mb-2"
                  suppressHydrationWarning
                >
                  {mounted ? t("auth.login.email") : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    suppressHydrationWarning
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-border dark:border-gray-600 rounded-xl bg-background dark:bg-gray-900/50 text-text-primary dark:text-gray-100 placeholder:text-text-secondary/60 dark:placeholder:text-gray-400/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 dark:focus:border-primary/50 dark:focus:ring-primary/40 transition-all duration-200"
                    placeholder={mounted ? t("auth.login.emailPlaceholder") : "Enter your email"}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-text-primary mb-2"
                  suppressHydrationWarning
                >
                  {mounted ? t("auth.login.password") : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    suppressHydrationWarning
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-border dark:border-gray-600 rounded-xl bg-background dark:bg-gray-900/50 text-text-primary dark:text-gray-100 placeholder:text-text-secondary/60 dark:placeholder:text-gray-400/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 dark:focus:border-primary/50 dark:focus:ring-primary/40 transition-all duration-200"
                    placeholder={mounted ? t("auth.login.passwordPlaceholder") : "Enter your password"}
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    suppressHydrationWarning
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-primary focus:ring-primary border-border rounded cursor-pointer transition-colors duration-200"
                  />
                  <span className="text-sm text-text-secondary dark:text-gray-300 group-hover:text-text-primary dark:group-hover:text-gray-200 transition-colors duration-200" suppressHydrationWarning>
                    {mounted ? t("auth.login.rememberMe") : "Remember me"}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  suppressHydrationWarning
                >
                  {mounted ? t("auth.login.forgotPassword") : "Forgot password?"}
                </button>
              </div>

              {/* Submit Button */}
              <button
                suppressHydrationWarning
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary-hover px-6 py-3 text-base font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span suppressHydrationWarning>{mounted ? t("auth.login.signingIn") : "Signing in..."}</span>
                  </>
                ) : (
                  <>
                    <span suppressHydrationWarning>{mounted ? t("auth.login.signIn") : "Sign In"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 text-center pt-6 border-t border-border/60 dark:border-gray-700/60">
              <p className="text-sm text-text-secondary dark:text-gray-300" suppressHydrationWarning>
                {mounted ? t("auth.login.noAccount") : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/signup")}
                  className="text-primary hover:text-primary-hover font-semibold transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  suppressHydrationWarning
                >
                  {mounted ? t("auth.login.signUp") : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </Reveal>
  );
}
