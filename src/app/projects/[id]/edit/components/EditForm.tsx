"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { PencilIcon } from "@heroicons/react/24/outline";
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

interface FormData {
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  deadline: string;
  skillsRequired: string[];
  categoryId: string;
  timeline: string;
  imageUrl: string;
  sampleImages: string[];
}

export default function EditForm({
  project,
  user,
  t,
  deleteProjectImage,
}: Props) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
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
    sampleImages: project.sampleImages || [],
  });

  // ✅ Fetch categories
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

  // ✅ Cloudinary upload helper
  const uploadToCloudinary = async (
    file: File,
    type: "banner" | "sample"
  ): Promise<void> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      alert("Missing Cloudinary configuration");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body }
    );
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    if (type === "banner") {
      setFormData((p) => ({ ...p, imageUrl: data.secure_url }));
    } else {
      setFormData((p) => ({
        ...p,
        sampleImages: [...(p.sampleImages || []), data.secure_url],
      }));
    }
  };

  // ✅ Banner upload handler
  const handleBannerSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadToCloudinary(file, "banner");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Sample upload handler
  const handleSampleSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSample(true);
    try {
      await uploadToCloudinary(file, "sample");
    } catch (err) {
      console.error("Sample upload failed:", err);
    } finally {
      setUploadingSample(false);
    }
  };

  // ✅ Remove sample image (fixed typing)
  const removeSample = (url: string): void => {
    setFormData((prev) => ({
      ...prev,
      sampleImages: prev.sampleImages?.filter((img: string) => img !== url),
    }));
  };

  // ✅ Handle submit with escrow logic
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user || saving) return;

    try {
      setSaving(true);
      setError("");

      const selectedCategory = categories.find(
        (c) => c.id === formData.categoryId
      );

      const newBudget = Number(formData.budget);
      const oldBudget = Number(project.budget);
      const budgetDiff = newBudget - oldBudget;

      // 🔹 Fetch client profile
      const clientRef = doc(db, "profiles", user.uid);
      const clientSnap = await getDoc(clientRef);
      const clientData = clientSnap.data() || {};
      const currentCredit = clientData.credit ?? 0;

      // 🔸 Budget increase → deduct credit
      if (budgetDiff > 0) {
        if (currentCredit < budgetDiff) {
          setError(
            t("editProject.notEnoughCredit") ||
              "Not enough credit to increase the project budget."
          );
          setSaving(false);
          return;
        }

        const newCredit = currentCredit - budgetDiff;
        await updateDoc(clientRef, {
          credit: newCredit,
          updatedAt: serverTimestamp(),
        });

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: "escrow_add",
          amount: budgetDiff,
          currency: "LAK",
          status: "held",
          direction: "out",
          projectId: project.id,
          description: `Added ${budgetDiff} LAK to project "${formData.title}"`,
          createdAt: serverTimestamp(),
          previousBalance: currentCredit,
          newBalance: newCredit,
        });
      }

      // 🔸 Budget decrease → refund
      if (budgetDiff < 0) {
        const refundAmount = Math.abs(budgetDiff);
        const newCredit = currentCredit + refundAmount;

        await updateDoc(clientRef, {
          credit: newCredit,
          updatedAt: serverTimestamp(),
        });

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          type: "escrow_refund",
          amount: refundAmount,
          currency: "LAK",
          status: "completed",
          direction: "in",
          projectId: project.id,
          description: `Refunded ${refundAmount} LAK for reduced project "${formData.title}"`,
          createdAt: serverTimestamp(),
          previousBalance: currentCredit,
          newBalance: newCredit,
        });
      }

      // 🖼️ Default image fallback
      const finalImage =
        formData.imageUrl?.trim() !== ""
          ? formData.imageUrl
          : "/images/sample-project.jpg";

      // ✅ Update project
      await updateDoc(doc(db, "projects", project.id), {
        title: formData.title,
        description: formData.description,
        budget: newBudget,
        budgetType: formData.budgetType,
        deadline: formData.deadline,
        skillsRequired: formData.skillsRequired,
        timeline: formData.timeline,
        imageUrl: finalImage,
        sampleImages: formData.sampleImages || [],
        category: selectedCategory
          ? {
              id: selectedCategory.id,
              name_en: selectedCategory.name_en,
              name_lo: selectedCategory.name_lo,
            }
          : null,
        updatedAt: serverTimestamp(),
      });

      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error("❌ Error updating project:", err);
      setError(t("editProject.failedToUpdateProjectError"));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle skill input
  const handleSkillsChange = (skills: string): void => {
    const arr = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((p) => ({ ...p, skillsRequired: arr }));
  };

  // 🧩 UI
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

        {/* 🖼️ Banner Image */}
        <div className="space-y-3 text-center">
          <h3 className="font-medium text-text-primary">
            {t("createProject.bannerImage") || "Main Banner Image"}
          </h3>
          {formData.imageUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={formData.imageUrl}
                alt="Banner"
                className="w-64 h-auto rounded-lg border shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline mt-3 text-sm"
                disabled={uploading}
              >
                {uploading
                  ? t("createProject.uploading")
                  : t("createProject.replaceImage")}
              </button>
            </div>
          ) : (
            <div className="border-dashed border-2 p-6 rounded-lg bg-gray-50">
              <p className="text-text-secondary">
                {t("createProject.noImageSelected")}
              </p>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleBannerSelect}
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline mt-4"
              >
                {t("createProject.chooseImage")}
              </button>
            </div>
          )}
        </div>

        {/* 🖼️ Sample Images */}
        <div className="space-y-3 text-center">
          <h3 className="font-medium text-text-primary">
            {t("createProject.sampleImages")}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {formData.sampleImages?.map((url: string) => (
              <div key={url} className="relative w-28 h-28">
                <img
                  src={url}
                  alt="sample"
                  className="w-28 h-28 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeSample(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <input
            type="file"
            className="hidden"
            ref={sampleInputRef}
            accept="image/*"
            onChange={handleSampleSelect}
          />
          <button
            type="button"
            onClick={() => sampleInputRef.current?.click()}
            className={`btn btn-outline ${uploadingSample ? "opacity-60" : ""}`}
            disabled={uploadingSample}
          >
            {uploadingSample
              ? t("createProject.uploading")
              : t("createProject.addSampleImage")}
          </button>
        </div>

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
