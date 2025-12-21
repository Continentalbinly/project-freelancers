"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { requireDb } from "@/service/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Stepper, StepBasics, StepCategoryTags, StepMedia, StepPackage, type CatalogForm } from "../../components";
import type { Catalog } from "@/types/catalog";

export default function EditCatalogPage() {
  const { t } = useTranslationContext();
  const { user, profile } = useAuth();
  const { isAuthorized, isLoading } = useRoleGuard({ requiredRole: "freelancer", redirectTo: "/" });
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const steps = [t("editCatalogPage.stepBasics") || "Basics", t("editCatalogPage.stepCategory") || "Category & Tags", t("editCatalogPage.stepMedia") || "Media", t("editCatalogPage.stepPackage") || "Package"] as const;

  const [original, setOriginal] = useState<Catalog | null>(null);
  const [form, setFormState] = useState<CatalogForm | null>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const setForm = (patch: Partial<CatalogForm>) => setFormState((prev) => (prev ? { ...prev, ...patch } : prev));

  const canNext = useMemo(() => {
    if (!form) return false;
    if (step === 0) return form.title.trim().length >= 5 && form.description.trim().length >= 20;
    if (step === 1) return !!form.categoryId;
    if (step === 2) return (form.images || []).length > 0;
    if (step === 3) {
      const pkgs = form.packages || [];
      return pkgs.length > 0 && pkgs.every(p => p.price > 0 && p.deliveryDays > 0 && p.name.trim());
    }
    return true;
  }, [step, form]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(requireDb(), "catalogs", id));
      if (!snap.exists()) return router.push("/catalog");
      const data = { id: snap.id, ...(snap.data() as any) } as Catalog;
      setOriginal(data);
      setFormState({
        title: data.title || "",
        description: data.description || "",
        categoryId: data.category || "",
        category: data.category ? { id: data.category } : null,
        tags: data.tags || [],
        images: data.images || [],
        packages: data.packages || [{ id: "pkg-1", name: "Basic", price: 0, deliveryDays: 3, features: [] }],
      });
    };
    if (id) load();
  }, [id, router]);

  // Ensure only owner (or admin) can edit
  useEffect(() => {
    if (!original || !user || !profile) return;
    const isAdmin = profile.isAdmin === true || profile.role === "admin";
    if (!isAdmin && original.ownerId !== user.uid) {
      router.push("/catalog/manage");
    }
  }, [original, user, profile, router]);

  if (!user || isLoading || !isAuthorized) return null;
  if (!form) return null;

  const save = async () => {
    if (!original) return;
    setSaving(true);
    try {
      await updateDoc(doc(requireDb(), "catalogs", original.id), {
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images,
        category: form.categoryId || "general",
        tags: form.tags,
        packages: form.packages,
        updatedAt: serverTimestamp(),
      });
      router.push("/catalog/manage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{t("editCatalogPage.title") || "Edit Service"}</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">{t("editCatalogPage.subtitle") || "Update your service details and pricing"}</p>
        </div>

        <Stepper steps={steps as unknown as string[]} current={step} />

        <div className="rounded-xl border border-border shadow-sm bg-background p-4 sm:p-6">
          {step === 0 && <StepBasics form={form} setForm={setForm} />}
          {step === 1 && <StepCategoryTags form={form} setForm={setForm} />}
          {step === 2 && <StepMedia form={form} setForm={setForm} />}
          {step === 3 && <StepPackage form={form} setForm={setForm} />}
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
          <button className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-border bg-background text-text-primary font-medium hover:border-primary/30 transition-all text-sm sm:text-base" onClick={() => router.push("/catalog/manage")}>{t("editCatalogPage.cancel") || "Cancel"}</button>
          <div className="flex gap-2 sm:gap-3">
            {step < steps.length - 1 ? (
              <button disabled={!canNext || saving} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base">
                {t("editCatalogPage.next") || "Next"}
              </button>
            ) : (
              <button className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base" disabled={!canNext || saving} onClick={save}>{saving ? (t("editCatalogPage.saving") || "Saving…") : (t("editCatalogPage.save") || "Save")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
