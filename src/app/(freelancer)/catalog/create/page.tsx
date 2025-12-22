"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { requireDb } from "@/service/firebase";
import { collection, doc, serverTimestamp, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { Stepper, StepBasics, StepCategoryTags, StepMedia, StepPackage, type CatalogForm } from "../components";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import SaveDraftButton from "@/app/components/SaveDraftButton";

const steps = ["Basics", "Category & Tags", "Media", "Package"] as const;
const LOCAL_KEY = "createCatalogFormData";

export default function CreateCatalogPage() {
  const { user } = useAuth();
  const { isAuthorized, isLoading } = useRoleGuard({ requiredRole: "freelancer", redirectTo: "/" });
  const { t } = useTranslationContext();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [form, setFormState] = useState<CatalogForm>({
    title: "",
    description: "",
    categoryId: "",
    category: null,
    tags: [],
    images: [],
    packages: [{ id: "pkg-1", name: "Basic", price: 0, deliveryDays: 3, features: [] }],
  });

  const setForm = (patch: Partial<CatalogForm>) => setFormState((prev) => ({ ...prev, ...patch }));

  const renderSkeleton = () => (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
        <div className="h-6 w-32 bg-border rounded mb-4" />
        <div className="h-4 w-52 bg-border rounded mb-6" />
        <div className="h-2 w-full bg-border rounded-full mb-6" />

        <div className="rounded-xl border border-border bg-background p-4 sm:p-6 space-y-4">
          <div className="h-5 w-40 bg-border rounded" />
          <div className="h-10 w-full bg-border rounded" />
          <div className="h-5 w-52 bg-border rounded" />
          <div className="h-24 w-full bg-border rounded" />
          <div className="h-5 w-48 bg-border rounded" />
          <div className="h-10 w-full bg-border rounded" />
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
          <div className="h-11 w-32 bg-border rounded" />
          <div className="h-11 w-32 bg-border rounded" />
        </div>
      </div>
    </div>
  );

  // Load draft from Firestore or localStorage
  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return;

      try {
        // First try to load from Firestore
        const draftRef = doc(requireDb(), "catalog_drafts", user.uid);
        const snap = await getDoc(draftRef);

        if (snap.exists()) {
          const data = snap.data();
          console.log("Loaded draft from Firestore:", data);
          
          // Map Firestore fields to form structure
          const mappedData: CatalogForm = {
            title: data.title || "",
            description: data.description || "",
            categoryId: data.categoryId || "",
            category: data.category || null,
            tags: data.tags || [],
            images: data.images || [],
            packages: data.packages || [{ id: "pkg-1", name: "Basic", price: 0, deliveryDays: 3, features: [] }],
          };
          console.log("Mapped data:", mappedData);
          setFormState(mappedData);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(mappedData));
        } else {
          // Fallback to localStorage if no Firestore draft
          const saved = localStorage.getItem(LOCAL_KEY);
          if (saved) {
            const data = JSON.parse(saved);
            console.log("Loaded draft from localStorage:", data);
            setFormState(data);
          }
        }

        setDraftLoaded(true);
      } catch  {
        setDraftLoaded(true);
      }
    };

    loadDraft();
  }, [user]);

  const canNext = (() => {
    if (step === 0) return form.title.trim().length >= 5 && form.description.trim().length >= 20;
    if (step === 1) return !!form.categoryId;
    if (step === 2) return (form.images || []).length > 0;
    if (step === 3) {
      const pkgs = form.packages || [];
      return pkgs.length > 0 && pkgs.every(p => p.price > 0 && p.deliveryDays > 0 && p.name.trim());
    }
    return true;
  })();

  const handleSaveDraft = async () => {
    if (!user) throw new Error("Please login first");
    
    try {
      // Save to Firestore using user ID as doc ID
      const draftRef = doc(requireDb(), "catalog_drafts", user.uid);
      await setDoc(draftRef, {
        ownerId: user.uid,
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images,
        categoryId: form.categoryId || "general",
        category: form.categoryId || "general",
        tags: form.tags,
        packages: form.packages,
        status: "draft",
        updatedAt: serverTimestamp(),
      });
      
      // Also save to localStorage as backup
      localStorage.setItem(LOCAL_KEY, JSON.stringify(form));
    } catch  {
      // Silent fail
    }
  };

  if (!user || isLoading || !draftLoaded) return renderSkeleton();
  if (!isAuthorized) return null;

  const onSubmit = async () => {
    try {
      setSaving(true);
      const ref = doc(collection(requireDb(), "catalogs"));
      await setDoc(ref, {
        id: ref.id,
        ownerId: user!.uid,
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images,
        category: form.categoryId || "general",
        tags: form.tags,
        packages: form.packages,
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Clear draft after successful creation
      localStorage.removeItem(LOCAL_KEY);
      await deleteDoc(doc(requireDb(), "catalog_drafts", user!.uid));

      router.push("/catalog/manage");
    } catch  {
      // Silent fail
      alert(t("createCatalogPage.failedToSave") || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t("createCatalogPage.title") || "Create Service"}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            {t("createCatalogPage.subtitle") || "Add a new service offering with multiple pricing tiers"}
          </p>
        </div>

        <Stepper steps={steps as unknown as string[]} current={step} />

        <div className="rounded-xl border border-border shadow-sm bg-background p-4 sm:p-6 pb-24 sm:pb-6 mb-6 sm:mb-8">
          {step === 0 && <StepBasics form={form} setForm={setForm} />}
          {step === 1 && <StepCategoryTags form={form} setForm={setForm} />}
          {step === 2 && <StepMedia form={form} setForm={setForm} />}
          {step === 3 && <StepPackage form={form} setForm={setForm} />}
        </div>

        {/* Save Draft Button - Floating */}
        <SaveDraftButton
          onSave={handleSaveDraft}
          label={t("createCatalogPage.saveAsDraft") || "Save as Draft"}
          successMessage={t("createCatalogPage.draftSaved") || "Draft saved successfully!"}
          errorMessage={t("createCatalogPage.saveFailed") || "Failed to save draft"}
          disabled={saving}
        />

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 pb-8 sm:pb-0">
          <button disabled={step === 0 || saving} onClick={() => setStep((s) => Math.max(0, s - 1))} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-border bg-background text-text-primary font-medium hover:border-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base">
            {t("createCatalogPage.back") || "Back"}
          </button>
          {step < steps.length - 1 ? (
            <button disabled={!canNext || saving} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base">
              {t("createCatalogPage.next") || "Next"}
            </button>
          ) : (
            <button disabled={!canNext || saving} onClick={onSubmit} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base">
              {saving ? (t("createCatalogPage.saving") || "Saving…") : (t("createCatalogPage.saveDraft") || "Save Draft")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
