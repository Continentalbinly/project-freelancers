export function getCategoryLabel(category: any, lang: string = "en") {
  if (!category) return "—";
  if (typeof category === "string") return category;
  return lang === "lo" ? category.name_lo : category.name_en;
}
