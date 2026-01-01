/**
 * Shared Status Configuration for Projects and Orders
 * Unified status colors, labels, and icons across the application
 */

import { Clock, CheckCircle, XCircle, DollarSign, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import React from "react";

// Icon factory functions using React.createElement to avoid JSX in .ts file
const createIcon = (IconComponent: typeof Clock): ReactNode => {
  return React.createElement(IconComponent, { className: "w-4 h-4" });
};

// ============================================
// PROJECT STATUSES
// ============================================
export type ProjectStatus =
  | "open"
  | "in_progress"
  | "in_review"
  | "payout_project"
  | "completed"
  | "cancelled";

// ============================================
// ORDER STATUSES
// ============================================
export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "delivered"
  | "awaiting_payment"
  | "completed"
  | "cancelled"
  | "refunded";

// ============================================
// UNIFIED STATUS CONFIG
// ============================================
export interface StatusConfig {
  color: string; // Text color
  bgColor: string; // Background color
  borderColor?: string; // Border color (optional)
  icon?: ReactNode; // Icon component
  label: {
    en: string;
    lo: string;
  };
}

// Project status configuration
export const projectStatusConfig: Record<ProjectStatus, StatusConfig> = {
  open: {
    color: "text-amber-600 dark:text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: createIcon(Clock),
    label: {
      en: "Open",
      lo: "ເປີດຮັບຟຣີແລນຊ໌",
    },
  },
  in_progress: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: createIcon(Clock),
    label: {
      en: "In Progress",
      lo: "ກຳລັງເຮັດວຽກ",
    },
  },
  in_review: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: createIcon(AlertCircle),
    label: {
      en: "In Review",
      lo: "ກຳລັງກວດສອບ",
    },
  },
  payout_project: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: createIcon(DollarSign),
    label: {
      en: "Awaiting Payment",
      lo: "ກຳລັງລໍຖ້າການຊຳລະ",
    },
  },
  completed: {
    color: "text-success dark:text-green-400",
    bgColor: "bg-success/10 dark:bg-green-950/30",
    borderColor: "border-success/30 dark:border-green-800",
    icon: createIcon(CheckCircle),
    label: {
      en: "Completed",
      lo: "ສຳເລັດແລ້ວ",
    },
  },
  cancelled: {
    color: "text-error dark:text-red-400",
    bgColor: "bg-error/10 dark:bg-red-950/30",
    borderColor: "border-error/30 dark:border-red-800",
    icon: createIcon(XCircle),
    label: {
      en: "Cancelled",
      lo: "ຍົກເລີກ",
    },
  },
};

// Order status configuration
export const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    color: "text-amber-600 dark:text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: createIcon(Clock),
    label: {
      en: "Pending",
      lo: "ລໍຖ້າ",
    },
  },
  accepted: {
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: createIcon(CheckCircle),
    label: {
      en: "Accepted",
      lo: "ຍອມຮັບ",
    },
  },
  in_progress: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: createIcon(Clock),
    label: {
      en: "In Progress",
      lo: "ກຳລັງເຮັດວຽກ",
    },
  },
  delivered: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    icon: createIcon(CheckCircle),
    label: {
      en: "Delivered",
      lo: "ສົ່ງແລ້ວ",
    },
  },
  awaiting_payment: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: createIcon(DollarSign),
    label: {
      en: "Awaiting Payment",
      lo: "ກຳລັງລໍຖ້າການຊຳລະ",
    },
  },
  completed: {
    color: "text-success dark:text-green-400",
    bgColor: "bg-success/10 dark:bg-green-950/30",
    borderColor: "border-success/30 dark:border-green-800",
    icon: createIcon(CheckCircle),
    label: {
      en: "Completed",
      lo: "ສຳເລັດແລ້ວ",
    },
  },
  cancelled: {
    color: "text-error dark:text-red-400",
    bgColor: "bg-error/10 dark:bg-red-950/30",
    borderColor: "border-error/30 dark:border-red-800",
    icon: createIcon(XCircle),
    label: {
      en: "Cancelled",
      lo: "ຍົກເລີກ",
    },
  },
  refunded: {
    color: "text-error dark:text-red-400",
    bgColor: "bg-error/10 dark:bg-red-950/30",
    borderColor: "border-error/30 dark:border-red-800",
    icon: createIcon(XCircle),
    label: {
      en: "Refunded",
      lo: "ຄືນເງິນ",
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status label in specified language
 */
export function getStatusLabel(
  status: ProjectStatus | OrderStatus,
  lang: "en" | "lo" = "en",
  type: "project" | "order" = "project"
): string {
  const config =
    type === "project"
      ? projectStatusConfig[status as ProjectStatus]
      : orderStatusConfig[status as OrderStatus];
  return config?.label[lang] || String(status);
}

/**
 * Get status configuration
 */
export function getStatusConfig(
  status: ProjectStatus | OrderStatus,
  type: "project" | "order" = "project"
): StatusConfig {
  const config =
    type === "project"
      ? projectStatusConfig[status as ProjectStatus]
      : orderStatusConfig[status as OrderStatus];
  return config || projectStatusConfig.open;
}

/**
 * Get all project statuses in order
 */
export const projectStatusOrder: ProjectStatus[] = [
  "open",
  "in_progress",
  "in_review",
  "payout_project",
  "completed",
];

/**
 * Get all order statuses in order
 */
export const orderStatusOrder: OrderStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "delivered",
  "awaiting_payment",
  "completed",
];

