"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import { PencilIcon } from "@heroicons/react/24/outline";
import ImageUploader from "./ImageUploader";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

interface Props {
  project: any;
  user: any;
  t: (key: string) => string;
  deleteProjectImage: (url: string) => Promise<void>;
}

export default function EditForm({
  project,
  user,
  t,
  deleteProjectImage,
}: Props) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();

  // 🧠 State
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    budget: project.budget || 0,
    budgetType: project.budgetType || "fixed",
    deadline: project.deadline
      ? new Date(project.deadline).toISOString().split("T")[0]
      : "",
    skillsRequired: project.skillsRequired || [],
    categoryId: project.category?.id || "",
    timeline: project.timeline || "",
    imageUrl: project.imageUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch categories dynamically
  useEffect(() => {
    async function fetchCategories() {
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Category, "id">),
        }));
        setCategories(list);
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // ✅ Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;

    try {
      setSaving(true);

      // Find selected category object
      const selectedCategory = categories.find(
        (c) => c.id === formData.categoryId
      );

      await updateDoc(doc(db, "projects", project.id), {
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        budgetType: formData.budgetType,
        deadline: formData.deadline,
        skillsRequired: formData.skillsRequired,
        timeline: formData.timeline,
        imageUrl: formData.imageUrl,
        category: selectedCategory
          ? {
              id: selectedCategory.id,
              name_en: selectedCategory.name_en,
              name_lo: selectedCategory.name_lo,
            }
          : null,
        updatedAt: new Date(),
      });

      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      setError(t("editProject.failedToUpdateProjectError"));
    } finally {
      setSaving(false);
    }
  };

  const handleSkillsChange = (skills: string) => {
    const arr = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((p) => ({ ...p, skillsRequired: arr }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary">
          {t("editProject.projectDetails")}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            {t("editProject.projectTitleRequired")}
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            {t("editProject.projectDescriptionRequired")}
          </label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            {t("editProject.budgetRequired")}
          </label>
          <input
            type="number"
            min="0"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-text-secondary mt-1">
            {t("createProject.fixedPriceOnly")}
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            {t("editProject.categoryRequired")}
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("editProject.selectCategory")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {currentLanguage === "lo"
                  ? cat.name_lo || cat.name_en
                  : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            {t("editProject.skillsRequired")}
          </label>
          <input
            type="text"
            value={formData.skillsRequired.join(", ")}
            onChange={(e) => handleSkillsChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder={t("editProject.eGReactNodeJsUiUxDesign")}
          />
        </div>

        {/* Image Upload */}
        <ImageUploader
          formData={formData}
          setFormData={setFormData}
          deleteProjectImage={deleteProjectImage}
          t={t}
        />

        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border border-border rounded-lg text-sm"
          >
            {t("editProject.cancel")}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-70 transition"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("editProject.saving")}
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4" />
                {t("editProject.updateProject")}
              </>
            )}
          </button>
        </div>

        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}
