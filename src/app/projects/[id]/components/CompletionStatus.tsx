"use client";
import { convertTimestampToDate } from "@/service/timeUtils";

export default function CompletionStatus({ project, t, formatDate }: any) {
  const clientDone =
    project.clientCompleted && Object.keys(project.clientCompleted).length > 0;
  const freelancerDone =
    project.freelancerCompleted &&
    Object.keys(project.freelancerCompleted).length > 0;

  const getStatus = () => {
    if (clientDone && freelancerDone)
      return {
        label: t("projectDetail.projectCompleted"),
        color: "bg-success-light text-success",
        desc: t("projectDetail.projectCompletedDesc"),
      };
    if (clientDone)
      return {
        label: t("projectDetail.clientCompleted"),
        color: "bg-warning-light text-warning",
        desc: t("projectDetail.clientCompletedDesc"),
      };
    if (freelancerDone)
      return {
        label: t("projectDetail.freelancerCompleted"),
        color: "bg-info-light text-info",
        desc: t("projectDetail.freelancerCompletedDesc"),
      };
    return null;
  };

  const status = getStatus();
  if (!status) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("projectDetail.completionStatus")}
      </h3>

      <div className="space-y-4">
        {/* ✅ Overall */}
        <div className={`p-4 rounded-lg ${status.color}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          <p className="text-sm">{status.desc}</p>
        </div>

        {/* 🧑‍💼 Client Completed */}
        {clientDone && (
          <div className="p-3 bg-success-light rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-success">
                {t("projectDetail.clientCompleted")}
              </span>
              {project.clientCompleted.completedAt && (
                <span className="text-xs text-success">
                  {formatDate(
                    convertTimestampToDate(project.clientCompleted.completedAt)
                  )}
                </span>
              )}
            </div>
            {project.clientCompleted.completionNotes && (
              <p className="text-sm text-success">
                {project.clientCompleted.completionNotes}
              </p>
            )}
          </div>
        )}

        {/* 🧑‍🔧 Freelancer Completed */}
        {freelancerDone && (
          <div className="p-3 bg-primary-light rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                {t("projectDetail.freelancerCompleted")}
              </span>
              {project.freelancerCompleted.completedAt && (
                <span className="text-xs text-primary">
                  {formatDate(
                    convertTimestampToDate(
                      project.freelancerCompleted.completedAt
                    )
                  )}
                </span>
              )}
            </div>
            {project.freelancerCompleted.completionNotes && (
              <p className="text-sm text-primary">
                {project.freelancerCompleted.completionNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
