"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function WithdrawSummary({ profile, userRole }: any) {
  const { t } = useTranslationContext();

  // Client: show credit only
  if (userRole === "client") {
    return (
      <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="text-sm sm:text-base">
          <p className="text-text-secondary">{t("withdraw.summary.credit")}</p>
          <p className="font-bold text-primary text-2xl mt-2">
            {profile.credit?.toLocaleString() || 0} LAK
          </p>
        </div>
      </div>
    );
  }

  // Freelancer: show earned only
  if (userRole === "freelancer") {
    return (
      <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="text-sm sm:text-base">
          <p className="text-text-secondary">{t("withdraw.summary.earned")}</p>
          <p className="font-bold text-success text-2xl mt-2">
            {profile.totalEarned?.toLocaleString() || 0} LAK
          </p>
        </div>
      </div>
    );
  }

  // Fallback: show both
  return (
    <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex justify-between text-sm sm:text-base">
        <div>
          <p className="text-text-secondary">{t("withdraw.summary.credit")}</p>
          <p className="font-bold text-primary text-xl mt-1">
            {profile.credit?.toLocaleString() || 0} LAK
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary">{t("withdraw.summary.earned")}</p>
          <p className="font-bold text-success text-xl mt-1">
            {profile.totalEarned?.toLocaleString() || 0} LAK
          </p>
        </div>
      </div>
    </div>
  );
}
