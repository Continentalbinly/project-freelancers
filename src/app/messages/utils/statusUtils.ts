export const projectStatusLabels: Record<
  string,
  { en: string; lo: string; color: string }
> = {
  open: {
    en: "Open",
    lo: "ເປີດໃຫ້ຈ້າງ",
    color: "bg-yellow-100 text-yellow-700",
  },
  in_progress: {
    en: "In Progress",
    lo: "ກຳລັງເຮັດວຽກ",
    color: "bg-blue-100 text-blue-700",
  },
  in_review: {
    en: "In Review",
    lo: "ກຳລັງກວດສອບ",
    color: "bg-purple-100 text-purple-700",
  },
  completed: {
    en: "Completed",
    lo: "ສຳເລັດແລ້ວ",
    color: "bg-green-100 text-green-700",
  },
};

export function getProjectStatusLabel(
  status: string,
  lang: "en" | "lo" = "en"
) {
  return (projectStatusLabels[status] || {
    en: status,
    lo: status,
    color: "text-gray-600",
  })[lang];
}
