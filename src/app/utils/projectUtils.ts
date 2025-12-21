import type { CategoryRef } from "@/types/project";

export function getCategoryLabel(category: string | CategoryRef | null | undefined, lang: string = "en") {
  if (!category) return "—";
  if (typeof category === "string") return category;
  return lang === "lo" ? category.name_lo : category.name_en;
}
