// app/my-projects/utils/statusUtils.ts

/** 🎨 Project status → color mapping (Tailwind classes) */
export const statusColors: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  in_review: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

/** 🌏 Multilingual labels for project statuses (EN / LO) */
export const statusLabels: Record<string, { en: string; lo: string }> = {
  open: { en: "Open", lo: "ເປີດຮັບຟຣີແລນຊ໌" },
  in_progress: { en: "In Progress", lo: "ກຳລັງເຮັດວຽກ" },
  in_review: { en: "In Review", lo: "ກຳລັງກວດສອບ" },
  completed: { en: "Completed", lo: "ສຳເລັດແລ້ວ" },
  cancelled: { en: "Cancelled", lo: "ຍົກເລີກ" },
};

/** 🧩 Helper — safely get localized label */
export function getStatusLabel(
  status: string,
  lang: "en" | "lo" = "en"
): string {
  return statusLabels[status]?.[lang] || status;
}
