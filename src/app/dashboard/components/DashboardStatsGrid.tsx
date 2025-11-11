"use client";
import { formatEarnings } from "@/service/currencyUtils";

export default function DashboardStatsGrid({ stats, profile, t }: any) {
  const userType = profile?.userType;
  const isClient = Array.isArray(userType)
    ? userType.includes("client")
    : userType === "client";
  const isFreelancer = Array.isArray(userType)
    ? userType.includes("freelancer")
    : userType === "freelancer";

  // 🧩 Build card data dynamically — always 3 max
  const baseCards = [
    {
      title: t("dashboard.stats.activeProjects"),
      value: stats.activeProjects,
      subtitle: t("dashboard.stats.currentlyWorking"),
      color: "primary",
    },
  ];

  let roleCards: any[] = [];

  if (isClient && isFreelancer) {
    // Dual role: show combined summary (Earned, Spent, Completed)
    roleCards = [
      {
        title: t("dashboard.stats.totalEarned"),
        value: formatEarnings(stats.totalEarned),
        subtitle: t("dashboard.stats.fromCompletedProjects"),
        color: "success",
      },
      {
        title: t("dashboard.stats.totalSpent"),
        value: formatEarnings(stats.totalSpent),
        subtitle: t("dashboard.stats.onCompletedProjects"),
        color: "error",
      },
    ];
  } else if (isClient) {
    // Client-only: Spent, Completed
    roleCards = [
      {
        title: t("dashboard.stats.totalSpent"),
        value: formatEarnings(stats.totalSpent),
        subtitle: t("dashboard.stats.onCompletedProjects"),
        color: "error",
      },
      {
        title: t("dashboard.stats.completed"),
        value: stats.projectsCompleted,
        subtitle: t("dashboard.stats.projectsFinished"),
        color: "secondary",
      },
    ];
  } else {
    // Freelancer-only: Earned, Completed
    roleCards = [
      {
        title: t("dashboard.stats.totalEarned"),
        value: formatEarnings(stats.totalEarned),
        subtitle: t("dashboard.stats.fromCompletedProjects"),
        color: "success",
      },
      {
        title: t("dashboard.stats.completed"),
        value: stats.projectsCompleted,
        subtitle: t("dashboard.stats.projectsFinished"),
        color: "secondary",
      },
    ];
  }

  const allCards = [...baseCards, ...roleCards].slice(0, 3); // limit to 3 cards

  return (
    <div
      className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        xl:grid-cols-3 
        gap-4 sm:gap-6 
        mb-8 
        auto-rows-fr
      "
    >
      {allCards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    error: "text-error bg-error/10",
    secondary: "text-secondary bg-secondary/10",
  };

  return (
    <div
      className="
        bg-white 
        rounded-2xl 
        shadow-sm 
        border border-border 
        p-4 sm:p-5 
        flex flex-col 
        justify-between 
        hover:shadow-md 
        transition-all 
        duration-200 
        hover:-translate-y-0.5
      "
    >
      <p className="text-sm sm:text-base font-medium text-text-secondary">
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
        {value}
      </p>
      <p className={`text-xs sm:text-sm mt-1 ${colorMap[color].split(" ")[0]}`}>
        {subtitle}
      </p>
    </div>
  );
}
