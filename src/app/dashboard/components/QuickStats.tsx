"use client";

import { formatEarnings } from "@/service/currencyUtils";

export default function QuickStats({ stats, profile, t }: any) {
  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t("dashboard.thisMonth.title")}
      </h2>
      <div className="space-y-2 text-sm">
        <Row
          label={t("dashboard.thisMonth.projectsCompleted")}
          value={`+${stats.projectsCompleted}`}
        />
        <Row
          label={t("dashboard.thisMonth.proposalsSent")}
          value={`+${stats.proposalsSubmitted}`}
        />
        <Row
          label={t("dashboard.thisMonth.activeProjects")}
          value={stats.activeProjects}
        />
        <Row
          label={
            isClient
              ? t("dashboard.thisMonth.spent")
              : t("dashboard.thisMonth.earnings")
          }
          value={
            isClient
              ? `-${formatEarnings(stats.totalSpent)}`
              : `+${formatEarnings(stats.totalEarned)}`
          }
        />
      </div>
    </div>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
