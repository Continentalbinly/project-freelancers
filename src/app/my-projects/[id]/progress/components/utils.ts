// ================================
// PROJECT STATUS DEFINITIONS
// ================================

// ✅ Step order for project flow
export const statusSteps = [
  "open",
  "in_progress",
  "in_review",
  "payout_project", // ⭐ NEW
  "completed",
] as const;

// => Creates: "open" | "in_progress" | "in_review" | "payout_project" | "completed"
export type ProjectStatus = (typeof statusSteps)[number];

// ================================
// USER ROLES
// ================================
export type UserRole = "freelancer" | "client" | null;

// ================================
// STATUS COLORS (Used in badges/UI)
// ================================
export const statusColors: Record<ProjectStatus, string> = {
  open: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-purple-100 text-purple-700",

  payout_project: "bg-orange-100 text-orange-700", // ⭐ NEW STEP COLOR

  completed: "bg-green-100 text-green-700",
};

// ================================
// STATUS LABELS (EN / LO)
// ================================
export const statusLabels: Record<ProjectStatus, { en: string; lo: string }> = {
  open: {
    en: "Open",
    lo: "ເປີດຮັບຟຣີແລນຊ໌",
  },
  in_progress: {
    en: "In Progress",
    lo: "ກຳລັງດຳເນີນງານ",
  },
  in_review: {
    en: "In Review",
    lo: "ກຳລັງກວດສອບ",
  },

  payout_project: {
    en: "Awaiting Payment",
    lo: "ກຳລັງລໍຖ້າການຊຳລະ", // ⭐ NEW
  },

  completed: {
    en: "Completed",
    lo: "ສຳເລັດແລ້ວ",
  },
};

// ================================
// HELPER — GET LABEL BASED ON LANGUAGE
// ================================
export function getStatusLabel(
  status: ProjectStatus,
  lang: "en" | "lo" = "en"
): string {
  return statusLabels[status]?.[lang] ?? status;
}

// ================================
// HELPER — DETERMINE USER ROLE IN A PROJECT
// ================================
import type { Project } from "@/types/project";

export function getRole(project: Project, userId?: string): UserRole {
  if (!userId) return null;

  if (project.acceptedFreelancerId === userId) return "freelancer";
  if (project.clientId === userId) return "client";

  return null;
}
