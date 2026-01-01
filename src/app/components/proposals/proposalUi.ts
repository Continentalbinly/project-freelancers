import type { ProposalWithDetails } from "@/types/proposal";
import { timeAgo } from "@/service/timeUtils";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface StatusConfig {
  label: string;
  className: string;
}

export const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      };
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    case "withdrawn":
      return {
        label: "Withdrawn",
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      };
    default:
      return {
        label: status,
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      };
  }
};

export const formatProposalTime = (
  date: Date | any,
  currentLanguage: string = "en"
): string => {
  return timeAgo(date, currentLanguage as "en" | "lo");
};

export const getFreelancerName = (proposal: ProposalWithDetails): string => {
  return proposal.freelancer?.fullName || "Unknown";
};

export const getProjectTitle = (proposal: ProposalWithDetails): string => {
  return proposal.project?.title || "Untitled Project";
};

