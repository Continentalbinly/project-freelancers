"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

interface WithdrawSummaryProps {
  profile: any;
}

export default function WithdrawSummary({ profile }: WithdrawSummaryProps) {
  const { t } = useTranslationContext();

  return (
    <div className="bg-gray-50 border border-border rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="font-semibold text-lg text-text-primary mb-3">
        {t("withdraw.summary.title")}
      </h2>
      <div className="flex justify-between text-sm sm:text-base">
        <div>
          <p className="text-text-secondary">{t("withdraw.summary.credit")}</p>
          <p className="text-primary font-bold">
            {profile.credit?.toLocaleString() || 0} LAK
          </p>
        </div>
        <div>
          <p className="text-text-secondary">{t("withdraw.summary.earned")}</p>
          <p className="text-success font-bold">
            {profile.totalEarned?.toLocaleString() || 0} LAK
          </p>
        </div>
      </div>
    </div>
  );
}
