"use client";

import { TrendingUp } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Profile } from "@/types/profile";

interface WithdrawSummaryProps {
  profile: Profile;
  userRole: "freelancer" | "client" | "admin";
}

export default function WithdrawSummary({ profile, userRole }: WithdrawSummaryProps) {
  const { t } = useTranslationContext();

  // Freelancer: show earned only
  if (userRole === "freelancer") {
    const totalEarned = profile.totalEarned || 0;
    return (
      <div className="rounded-2xl border border-success/20 dark:border-success/30 bg-linear-to-br from-success/10 to-success/5 dark:from-success/20 dark:to-success/10 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-success/20 dark:bg-success/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-gray-400">
                  {t("withdraw.summary.earned") || "Total Earnings"}
                </p>
                <p className="text-3xl md:text-4xl font-bold text-success mt-1">
                  {totalEarned.toLocaleString()}
                  <span className="text-xl md:text-2xl ml-1">LAK</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-text-secondary dark:text-gray-400 mt-4">
              {t("withdraw.summary.description") || "This is the total amount you've earned from completed projects. You can withdraw any amount from this balance."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't happen for freelancer-only page)
  return null;
}
