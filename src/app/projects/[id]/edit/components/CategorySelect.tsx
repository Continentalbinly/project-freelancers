"use client";

export default function CategorySelect({
  categories,
  formData,
  setFormData,
  currentLanguage,
  t,
}: any) {
  const handleCategoryChange = (e: any) => {
    const newCategoryId = e.target.value;

    setFormData((prev: any) => ({
      ...prev,
      categoryId: newCategoryId,
      skillsRequired: [], // ✅ CLEAR ALL SELECTED SKILLS
    }));
  };

  return (
    <div>
      <label className="text-sm font-medium">
        {t("editProject.categoryRequired")}
      </label>

      <select
        value={formData.categoryId}
        onChange={handleCategoryChange}
        className="w-full px-3 py-2 border border-border rounded-lg mt-1"
      >
        <option value="">{t("editProject.selectCategory")}</option>

        {categories.map((cat: any) => (
          <option key={cat.id} value={cat.id}>
            {currentLanguage === "lo" ? cat.name_lo : cat.name_en}
          </option>
        ))}
      </select>
    </div>
  );
}
