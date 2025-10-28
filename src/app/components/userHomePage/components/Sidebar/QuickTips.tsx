"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function QuickTips({ profile }: any) {
  const { t } = useTranslationContext();

  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";

  const tips = isClient
    ? [
        t("userHomePage.quickTips.clientTips.tip1"),
        t("userHomePage.quickTips.clientTips.tip2"),
        t("userHomePage.quickTips.clientTips.tip3"),
        t("userHomePage.quickTips.clientTips.tip4"),
      ]
    : isFreelancer
    ? [
        t("userHomePage.quickTips.freelancerTips.tip1"),
        t("userHomePage.quickTips.freelancerTips.tip2"),
        t("userHomePage.quickTips.freelancerTips.tip3"),
        t("userHomePage.quickTips.freelancerTips.tip4"),
      ]
    : [
        t("userHomePage.quickTips.generalTips.tip1"),
        t("userHomePage.quickTips.generalTips.tip2"),
        t("userHomePage.quickTips.generalTips.tip3"),
        t("userHomePage.quickTips.generalTips.tip4"),
      ];

  return (
    <div className="bg-gradient-to-br from-primary-light to-secondary-light rounded-lg p-6">
      <h3 className="font-semibold text-text-primary mb-3">
        {t("userHomePage.quickTips.title")}
      </h3>
      <ul className="text-sm text-text-secondary space-y-2">
        {tips.map((tip, i) => (
          <li key={i}>• {tip}</li>
        ))}
      </ul>
    </div>
  );
}
