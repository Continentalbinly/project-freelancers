"use client";
import {
  CheckBadgeIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { Proposal } from "@/types/proposal";

interface ProposalStatusBadgeProps {
  status: Proposal["status"];
  t: (key: string) => string;
}

export default function ProposalStatusBadge({ status, t }: ProposalStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-success bg-success/10 border-success/20";
      case "rejected":
        return "text-error bg-error/10 border-error/20";
      case "pending":
        return "text-warning bg-warning/10 border-warning/20";
      case "withdrawn":
        return "text-text-secondary bg-background-secondary border-border";
      default:
        return "text-text-secondary bg-background-secondary border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckBadgeIcon className="w-5 h-5" />;
      case "rejected":
        return <XMarkIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted":
        return t("proposals.status.accepted");
      case "rejected":
        return t("proposals.status.rejected");
      case "pending":
        return t("proposals.status.pending");
      case "withdrawn":
        return t("proposals.status.withdrawn");
      default:
        return status;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(
        status
      )}`}
    >
      {getStatusIcon(status)}
      <span className="font-semibold">{getStatusText(status)}</span>
    </div>
  );
}
