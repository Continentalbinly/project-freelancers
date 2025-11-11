"use client";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";

export default function DashboardHeader({ profile, user, t }: any) {
  const userName = profile?.fullName || user?.email?.split("@")[0] || "User";
  const userType = profile?.userType;

  const typeLabel = Array.isArray(userType)
    ? userType
        .map((tpe) =>
          tpe === "freelancer"
            ? t("dashboard.header.freelancer")
            : t("dashboard.header.client")
        )
        .join(" & ")
    : userType === "freelancer"
    ? t("dashboard.header.freelancer")
    : userType === "client"
    ? t("dashboard.header.client")
    : t("dashboard.header.member");

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      {/* 👤 Avatar + Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto text-center sm:text-left">
        <div className="flex justify-center sm:justify-start">
          <Avatar {...getAvatarProps(profile, user)} size="lg" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary break-words">
            {t("dashboard.header.welcomeBack").replace("{name}", userName)}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary truncate">
            {typeLabel} • {profile?.email || user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
