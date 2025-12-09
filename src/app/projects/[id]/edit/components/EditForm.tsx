// components/EditForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/service/firebase";
import { useRouter } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import SkillManager from "./SkillManager";
import CategorySelect from "./CategorySelect";
import BannerUploader from "./BannerUploader";
import SampleUploader from "./SampleUploader";
import BudgetSelector from "./BudgetSelector";
import TimelineSelector from "./TimelineSelector";
import PostingFeePreview from "./PostingFeePreview";
import CreditDeductionModal from "./CreditDeductionModal";

import {
  getPostingFeePreview,
  applyPostingFeeChange,
} from "./PostingFeeHandler";

import { PencilIcon } from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

export default function EditForm({ project, user, t }: any) {
  const router = useRouter();
  const { currentLanguage } = useTranslationContext();

  const fileInputRef = useRef(null);
  const sampleInputRef = useRef(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingSample, setUploadingSample] = useState(false);
  const [saving, setSaving] = useState(false);

  const oldPostingFee = project.postingFee ?? 0;

  // Modal + posting fee preview
  const [showModal, setShowModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    budget: project.budget,
    skillsRequired: project.skillsRequired ?? [],
    categoryId: project.category?.id ?? "",
    timeline: project.timeline ?? "",
    imageUrl: project.imageUrl ?? "",
    sampleImages: project.sampleImages ?? [],
  });

  // -----------------------------------------
  // Load categories
  // -----------------------------------------
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Category, "id">),
        }))
      );
    }
    load();
  }, []);

  // -----------------------------------------
  // Live posting fee preview (auto-update)
  // -----------------------------------------
  useEffect(() => {
    const preview = getPostingFeePreview({
      oldPostingFee,
      newCategoryId: formData.categoryId,
    });

    setPreviewData(preview);
  }, [formData.categoryId]);

  // -----------------------------------------
  // Upload helpers
  // -----------------------------------------
  const uploadToCloudinary = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    return res.json();
  };

  const handleBannerSelect = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const upload = await uploadToCloudinary(file);

    setFormData((p) => ({ ...p, imageUrl: upload.secure_url }));
    setUploading(false);
  };

  const handleSampleSelect = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSample(true);

    const upload = await uploadToCloudinary(file);

    setFormData((p) => ({
      ...p,
      sampleImages: [...p.sampleImages, upload.secure_url],
    }));

    setUploadingSample(false);
  };

  // -----------------------------------------
  // Submit Handling (with modal flow)
  // -----------------------------------------
  const startSubmit = async (e: any) => {
    e.preventDefault();

    const preview = getPostingFeePreview({
      oldPostingFee,
      newCategoryId: formData.categoryId,
    });

    setPreviewData(preview);

    if (preview.diff !== 0) {
      setShowModal(true);
      return;
    }

    finalizeSubmit(preview);
  };

  const finalizeSubmit = async (preview: any) => {
    setSaving(true);

    // Deduct/refund credits ONLY if needed
    if (preview.diff !== 0) {
      const applied = await applyPostingFeeChange({
        userId: user.uid,
        projectId: project.id,
        oldPostingFee,
        newCategoryId: formData.categoryId,
      });

      if (!applied.success) {
        alert(t("editProject.notEnoughCredits"));
        setSaving(false);
        return;
      }
    }

    // -----------------------------------------
    // 🔥 FIX: Save FULL category object to Firestore
    // -----------------------------------------
    const selectedCategory = categories.find(
      (c) => c.id === formData.categoryId
    );

    await updateDoc(doc(db, "projects", project.id), {
      ...formData,
      category: selectedCategory
        ? {
            id: selectedCategory.id,
            name_en: selectedCategory.name_en,
            name_lo: selectedCategory.name_lo,
          }
        : null,
      postingFee: preview.newPostingFee,
      updatedAt: serverTimestamp(),
    });

    router.push(`/projects/${project.id}`);
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  return (
    <>
      <form
        onSubmit={startSubmit}
        className="space-y-8 p-6 bg-white border border-border rounded-xl"
      >
        {/* TITLE */}
        <div>
          <label className="text-sm">
            {t("editProject.projectTitleRequired")}
          </label>
          <input
            value={formData.title}
            required
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm">
            {t("editProject.projectDescriptionRequired")}
          </label>
          <textarea
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg"
          />
        </div>

        {/* BUDGET */}
        <BudgetSelector formData={formData} setFormData={setFormData} t={t} />

        {/* TIMELINE */}
        <TimelineSelector formData={formData} setFormData={setFormData} t={t} />

        {/* CATEGORY */}
        <CategorySelect
          categories={categories}
          formData={formData}
          setFormData={setFormData}
          currentLanguage={currentLanguage}
          t={t}
        />

        {/* LIVE POSTING FEE PREVIEW */}
        {previewData && (
          <PostingFeePreview
            oldFee={oldPostingFee}
            preview={previewData}
            t={t}
          />
        )}

        {/* SKILLS */}
        <SkillManager formData={formData} setFormData={setFormData} t={t} />

        {/* BANNER */}
        <BannerUploader
          t={t}
          formData={formData}
          setFormData={setFormData}
          uploading={uploading}
          fileInputRef={fileInputRef}
          handleBannerSelect={handleBannerSelect}
        />

        {/* SAMPLE IMAGES */}
        <SampleUploader
          t={t}
          formData={formData}
          setFormData={setFormData}
          uploadingSample={uploadingSample}
          sampleInputRef={sampleInputRef}
          handleSampleSelect={handleSampleSelect}
        />

        {/* SUBMIT BUTTON */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border border-border rounded-lg cursor-pointer"
          >
            {t("editProject.cancel")}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-primary text-white rounded-lg flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              t("editProject.saving")
            ) : (
              <>
                <PencilIcon className="w-4 h-4" />
                {t("editProject.updateProject")}
              </>
            )}
          </button>
        </div>
      </form>

      {/* MODAL FOR CREDIT DEDUCTION */}
      <CreditDeductionModal
        open={showModal}
        diff={previewData?.diff}
        oldPostingFee={oldPostingFee}
        newPostingFee={previewData?.newPostingFee}
        onCancel={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          finalizeSubmit(previewData);
        }}
        t={t}
      />
    </>
  );
}
