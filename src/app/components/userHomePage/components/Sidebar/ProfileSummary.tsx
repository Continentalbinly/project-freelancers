"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { formatEarnings } from "@/service/currencyUtils";

export default function ProfileSummary({ user, profile }: any) {
  const { t } = useTranslationContext();

  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";
  const hasBoth = isClient && isFreelancer;

  const stats = {
    projectsCompleted: profile?.projectsCompleted || 0,
    totalEarned: profile?.totalEarned || 0,
    totalSpent: profile?.totalSpent || 0,
    activeProjects: profile?.activeProjects || 0,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h3 className="font-semibold text-text-primary mb-4">
        {t("userHomePage.profileSummary.title")}
      </h3>

      <div className="space-y-3">
        <SummaryRow
          label={
            isClient && !isFreelancer
              ? t("userHomePage.profileSummary.clientRating")
              : isFreelancer && !isClient
              ? t("userHomePage.profileSummary.freelancerRating")
              : t("userHomePage.profileSummary.rating")
          }
          value={
            profile?.rating
              ? `${profile.rating}/5 ⭐`
              : t("userHomePage.profileSummary.noRatingsYet")
          }
        />
        <SummaryRow
          label={t("userHomePage.profileSummary.projectsCompleted")}
          value={stats.projectsCompleted}
        />

        <SummaryRow
          label={t("userHomePage.profileSummary.activeProjects")}
          value={stats.activeProjects}
        />
      </div>

      <Link href="/profile" className="btn btn-outline w-full mt-4">
        {t("userHomePage.profileSummary.editProfile")}
      </Link>
    </div>
  );
}

const SummaryRow = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-text-secondary">{label}</span>
    <span className="font-medium text-text-primary">{value}</span>
  </div>
);
