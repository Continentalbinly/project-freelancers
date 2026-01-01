// app/my-projects/utils/statusUtils.ts

/**
 * Re-export from shared status config for backward compatibility
 * @deprecated Use getStatusLabel and getStatusConfig from @/app/lib/workflow/status instead
 */
export {
  getStatusLabel,
  getStatusConfig,
  projectStatusConfig,
  type ProjectStatus,
} from "@/app/lib/workflow/status";

/** @deprecated Use projectStatusConfig instead */
export const statusColors: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-purple-50 text-purple-700 border-purple-200",
  payout_project: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

/** @deprecated Use projectStatusConfig instead */
export const statusLabels: Record<string, { en: string; lo: string }> = {
  open: { en: "Open", lo: "ເປີດຮັບຟຣີແລນຊ໌" },
  in_progress: { en: "In Progress", lo: "ກຳລັງເຮັດວຽກ" },
  in_review: { en: "In Review", lo: "ກຳລັງກວດສອບ" },
  payout_project: { en: "Awaiting Payment", lo: "ກຳລັງລໍຖ້າການຊຳລະ" },
  completed: { en: "Completed", lo: "ສຳເລັດແລ້ວ" },
  cancelled: { en: "Cancelled", lo: "ຍົກເລີກ" },
};
