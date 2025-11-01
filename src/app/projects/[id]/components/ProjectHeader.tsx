"use client";
import FavoriteButton from "@/app/components/FavoriteButton";
import { formatLAK } from "@/service/currencyUtils";

export default function ProjectHeader({ project, user, t }: any) {
  // 🎨 Status color mapping
  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-success-light text-success",
      in_progress: "bg-warning-light text-warning",
      in_review: "bg-amber-100 text-amber-700 border border-amber-300",
      completed: "bg-primary-light text-primary",
      cancelled: "bg-error-light text-error",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // 🏷️ Status label mapping
  const getStatusLabel = (status: string) => {
    const labels = {
      open: t("common.status.statusOpen") || "Open",
      in_progress: t("common.status.statusInProgress") || "In Progress",
      in_review: t("common.status.statusInReview") || "In Review",
      completed: t("common.status.statusCompleted") || "Completed",
      cancelled: t("common.status.statusCancelled") || "Cancelled",
    };
    return labels[status as keyof typeof labels] || status;
  };

  // 💰 Budget formatting
  const formatBudget = (budget: number, budgetType: string) => {
    return budgetType === "hourly"
      ? `${formatLAK(budget, { compact: true })}/hr`
      : formatLAK(budget, { compact: true });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex-1">
          {project.title}
        </h1>
        <FavoriteButton
          projectId={project.id}
          size="lg"
          className="flex-shrink-0"
          isProjectOwner={user?.uid === project.clientId}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 🟢 Status */}
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              project.status
            )}`}
          >
            {getStatusLabel(project.status)}
          </span>

          {/* 👀 Views */}
          <span className="text-sm text-text-secondary">
            {project.views} {t("projectDetail.views")}
          </span>

          {/* 💬 Proposals */}
          <span className="text-sm text-text-secondary">
            {project.proposalsCount}{" "}
            {project.proposalsCount !== 1
              ? t("projectDetail.proposals")
              : t("projectDetail.proposal")}
          </span>
        </div>

        {/* 💸 Budget */}
        <div className="text-left sm:text-right">
          <div className="text-2xl font-bold text-primary">
            {formatBudget(project.budget, project.budgetType)}
          </div>
          <div className="text-sm text-text-secondary">
            {project.budgetType === "hourly"
              ? t("projectDetail.perHour")
              : t("projectDetail.fixedPrice")}
          </div>
        </div>
      </div>
    </div>
  );
}
