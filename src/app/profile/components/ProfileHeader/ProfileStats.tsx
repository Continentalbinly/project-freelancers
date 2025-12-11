import { formatEarnings } from "@/service/currencyUtils";

export default function ProfileStats({ profile, t }: any) {
  const isFreelancer = profile?.userType?.includes("freelancer");

  const items = [
    {
      label: t("profile.stats.active"),
      value: profile?.activeProjects || 0,
      color: "text-primary",
    },
    {
      label: t("profile.stats.completed"),
      value: profile?.projectsCompleted || 0,
      color: "text-success",
    },

    // ⭐ Correct logic for client vs freelancer
    isFreelancer
      ? {
          label: t("profile.stats.earned"),
          value: formatEarnings(profile?.totalEarned || 0),
          color: "text-secondary",
        }
      : {
          label: t("profile.stats.spent"), 
          value: formatEarnings(profile?.totalSpent || 0),
          color: "text-error",
        },

    {
      label: t("profile.stats.rating"),
      value: `${profile?.rating || 0}/5`,
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center lg:items-start">
          <div className={`text-lg font-semibold ${it.color}`}>{it.value}</div>
          <div className="text-sm text-text-secondary">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
