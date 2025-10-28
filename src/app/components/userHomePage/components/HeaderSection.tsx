"use client";

import Link from "next/link";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { formatEarnings } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function HeaderSection({ user, profile }: any) {
  const { t } = useTranslationContext();

  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";

  const userStats = profile?.stats || {
    totalEarned: profile?.totalEarned || 0,
    totalSpent: profile?.totalSpent || 0,
    activeProjects: profile?.activeProjects || 0,
    projectsCompleted: profile?.projectsCompleted || 0,
  };

  const hasBoth = isClient && isFreelancer;

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar {...getAvatarProps(profile, user)} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary leading-tight break-words">
                {t("userHomePage.header.welcomeBack").replace(
                  "{name}",
                  profile?.fullName || user?.email?.split("@")[0] || ""
                )}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                {isClient && isFreelancer
                  ? `${t("userHomePage.header.client")} & ${t(
                      "userHomePage.header.freelancer"
                    )}`
                  : isClient
                  ? t("userHomePage.header.client")
                  : isFreelancer
                  ? t("userHomePage.header.freelancer")
                  : t("userHomePage.header.member")}
              </p>
              <Link
                href="/dashboard"
                className="text-primary hover:text-primary-hover font-medium text-sm mt-2 inline-block"
              >
                {t("userHomePage.header.viewDashboard")}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm w-full lg:w-auto">
            <Stat
              label={t("userHomePage.stats.active")}
              value={userStats.activeProjects}
              color="text-primary"
            />
            <Stat
              label={t("userHomePage.stats.completed")}
              value={userStats.projectsCompleted}
              color="text-success"
            />
            {hasBoth ? (
              <>
                <Stat
                  label={t("userHomePage.stats.earned")}
                  value={formatEarnings(userStats.totalEarned)}
                  color="text-success"
                />
                <Stat
                  label={t("userHomePage.stats.spent")}
                  value={formatEarnings(userStats.totalSpent)}
                  color="text-error"
                />
              </>
            ) : (
              <Stat
                label={
                  isClient
                    ? t("userHomePage.stats.spent")
                    : t("userHomePage.stats.earned")
                }
                value={formatEarnings(
                  isClient ? userStats.totalSpent : userStats.totalEarned
                )}
                color="text-secondary"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, color }: any) => (
  <div className="text-center min-w-[70px]">
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    <div className="text-xs text-text-secondary">{label}</div>
  </div>
);
