// ✅ Define allowed statuses as a literal tuple
export const statusSteps = [
  "open",
  "in_progress",
  "in_review",
  "completed",
] as const;

// ✅ Derive the literal union type from the tuple
export type ProjectStatus = (typeof statusSteps)[number];

// ✅ Define allowed user roles
export type UserRole = "freelancer" | "client" | null;

// ✅ Status color mapping — strongly typed
export const statusColors: Record<ProjectStatus, string> = {
  open: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  in_review: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

// ✅ EN–LO translation map
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
  completed: {
    en: "Completed",
    lo: "ສຳເລັດແລ້ວ",
  },
};

// ✅ Helper to get localized label
export function getStatusLabel(
  status: ProjectStatus,
  lang: "en" | "lo" = "en"
): string {
  return statusLabels[status]?.[lang] ?? status;
}

// ✅ Determine the user's role in a project
export function getRole(project: any, userId?: string): UserRole {
  if (!userId) return null;
  if (project.acceptedFreelancerId === userId) return "freelancer";
  if (project.clientId === userId) return "client";
  return null;
}
