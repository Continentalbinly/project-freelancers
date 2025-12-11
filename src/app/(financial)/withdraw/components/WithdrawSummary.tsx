"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function WithdrawSummary({ profile }: any) {
  const { t } = useTranslationContext();

  return (
    <div className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex justify-between text-sm sm:text-base">
        <div>
          <p className="text-text-secondary">{t("withdraw.summary.credit")}</p>
          <p className="font-bold text-primary text-xl mt-1">
            {profile.credit?.toLocaleString() || 0}
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
