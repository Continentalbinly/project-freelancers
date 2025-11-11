"use client";
import { timeAgo } from "@/service/timeUtils";
import { formatEarnings } from "@/service/currencyUtils";

export default function RecentActivity({
  recentActivity,
  loadingActivity,
  t,
  currentLanguage,
}: any) {
  if (loadingActivity)
    return (
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3">
          {t("dashboard.recentActivity.title")}
        </h2>
        <p className="text-sm text-text-secondary">{t("dashboard.loading")}</p>
      </div>
    );

  if (recentActivity.length === 0)
    return (
      <div className="bg-white rounded-xl p-6 text-center border border-border">
        <h2 className="text-base sm:text-lg font-semibold mb-2">
          {t("dashboard.recentActivity.noActivity")}
        </h2>
        <p className="text-sm text-text-secondary">
          {t("dashboard.recentActivity.noActivityDescription")}
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-border">
      <h2 className="text-base sm:text-lg font-semibold mb-4">
        {t("dashboard.recentActivity.title")}
      </h2>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {recentActivity.map((a: any) => (
          <div
            key={a.id}
            className="flex flex-col sm:flex-row sm:justify-between p-3 border border-border rounded-lg hover:shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-text-primary truncate">
                {a.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                {a.description}
              </p>
              <span className="text-[11px] sm:text-xs text-gray-400">
                {timeAgo(a.date, currentLanguage)}
              </span>
            </div>
            {a.amount && (
              <span className="text-xs sm:text-sm font-medium text-success mt-2 sm:mt-0 sm:ml-3 shrink-0">
                {formatEarnings(a.amount)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
