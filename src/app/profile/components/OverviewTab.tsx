"use client";

import { timeAgo } from "@/service/timeUtils";
import { formatEarnings } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface OverviewTabProps {
  t: (key: string) => string;
  userProjects: any[];
  profile: any;
  user: any;
  loadingData: boolean;
}

export default function OverviewTab({
  t,
  userProjects,
  profile,
  user,
  loadingData,
}: OverviewTabProps) {
  const { currentLanguage } = useTranslationContext();

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-success/10 text-success",
      in_progress: "bg-warning/10 text-warning",
      completed: "bg-primary/10 text-primary",
      cancelled: "bg-error/10 text-error",
      pending: "bg-secondary/10 text-secondary",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-background-secondary text-text-secondary"
    );
  };

  function getMemberSince(createdAt: any, t: any, user?: any): string {
    try {
      let date: Date | null = null;

      // ✅ Case 1: Firestore timestamp object
      if (createdAt?.seconds) {
        date = new Date(createdAt.seconds * 1000);
      }
      // ✅ Case 2: Firebase Timestamp (has .toDate)
      else if (typeof createdAt?.toDate === "function") {
        date = createdAt.toDate();
      }
      // ✅ Case 3: String (ISO)
      else if (typeof createdAt === "string" && !isNaN(Date.parse(createdAt))) {
        date = new Date(createdAt);
      }
      // ✅ Case 4: Number (milliseconds)
      else if (typeof createdAt === "number") {
        date = new Date(createdAt);
      }
      // ✅ Case 5: Date instance
      else if (createdAt instanceof Date) {
        date = createdAt;
      }
      // ✅ Case 6: Try Firebase Auth metadata
      else if (user?.metadata?.creationTime) {
        date = new Date(user.metadata.creationTime);
      }

      if (!date || isNaN(date.getTime())) {
        return t("profile.personalInfo.notSet");
      }

      // ✅ Force YYYY/MM/DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    } catch {
      return t("profile.personalInfo.notSet");
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      pending: "Pending",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold  ">
            {t("profile.personalInfo.title")}
          </h3>

          <div className="space-y-3">
            <InfoRow
              label={t("profile.personalInfo.fullName")}
              value={profile?.fullName || t("profile.personalInfo.notSet")}
            />
            <InfoRow
              label={t("profile.personalInfo.email")}
              value={profile?.email || user.email}
            />
            <InfoRow
              label={t("profile.personalInfo.location")}
              value={
                profile?.city && profile?.country
                  ? `${profile.city}, ${profile.country}`
                  : t("profile.personalInfo.notSet")
              }
            />
            <InfoRow
              label={t("profile.personalInfo.hourlyRate")}
              value={
                profile?.hourlyRate
                  ? `${formatEarnings(Number(profile.hourlyRate))}/hr`
                  : t("profile.personalInfo.notSet")
              }
            />
            <InfoRow
              label={t("profile.personalInfo.memberSince")}
              value={getMemberSince(profile?.createdAt, t, user)}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold  ">
            {t("profile.recentActivity.title")}
          </h3>

          {loadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-background-secondary rounded-lg animate-pulse border border-border dark:border-gray-700"
                >
                  <div className="h-4 rounded mb-2 w-3/4"></div>
                  <div className="h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {userProjects.slice(0, 3).map((project: any) => (
                <div
                  key={project.id}
                  className="p-3 bg-background-secondary rounded-lg border border-border dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium  ">
                      {project.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {timeAgo(project.createdAt, currentLanguage)}
                  </p>
                </div>
              ))}
              {userProjects.length === 0 && (
                <p className="text-center text-sm text-text-secondary py-4">
                  {t("profile.recentActivity.noProjects")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-border dark:border-gray-700">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium  ">{value}</span>
    </div>
  );
}
