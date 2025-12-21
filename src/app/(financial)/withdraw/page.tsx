"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import WithdrawSummary from "./components/WithdrawSummary";
import FreelancerWithdrawForm from "./components/FreelancerWithdrawForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function WithdrawPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();

  // Redirect clients immediately
  useEffect(() => {
    if (!authLoading && profile) {
      if (profile.role === "client") {
        router.push("/dashboard");
      }
    }
  }, [profile, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  // Block clients - show access denied message
  if (!user || profile?.role !== "freelancer") {
    return (
      <div className="min-h-screen px-4 py-8 bg-background">
        <div className="rounded-2xl border border-error/20 bg-error/5 dark:bg-error/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-error/20 dark:bg-error/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {t("withdraw.accessDenied.title") || "Access Restricted"}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("withdraw.accessDenied.message") ||
              "Withdrawal is only available for freelancers. Credits cannot be withdrawn as they are used for platform services."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      {/* Summary */}
      <WithdrawSummary profile={profile} userRole="freelancer" />

      {/* Withdraw Form */}
      <FreelancerWithdrawForm user={user} profile={profile} />
    </div>
  );
}
