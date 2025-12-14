"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { TIMELINE_OPTIONS, getTimelineData } from "@/service/timelineUtils";

import ProjectStepper from "../components/ProjectStepper";
import ProjectBasics from "../components/ProjectSteps/ProjectBasics";
import ProjectDetails from "../components/ProjectSteps/ProjectDetails";
import ProjectRequirements from "../components/ProjectSteps/ProjectRequirements";
import ProjectMedia from "../components/ProjectSteps/ProjectMedia";
import ProjectReview from "../components/ProjectSteps/ProjectReview";
import SaveDraftButton from "../../../components/SaveDraftButton";

import type { ProjectFormData } from "../components/ProjectSteps/ProjectBasics";

const LOCAL_KEY = "createProjectFormData";
const MAX_STEPS = 5;
const CATEGORY_POSTING_FEES: Record<string, number> = {
  // Marketing
  "5qL77RdIESzkpoZjtRoQ": 10,
  // Copy Writing
  ACVAA2l5pPBtmoYllGlp: 10,
  // Design
  GZSyBzgtM66bvWIfkYje: 20,
  // Web Developer
  Kv3AmZ6kgMpqWaXN0MLK: 25,
  // Mobile Developer
  MaDKsBJWM3i6cyh5s1pt: 25,
};

function removeUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    if (v !== undefined) {
      acc[k] =
        typeof v === "object" && v !== null && !Array.isArray(v)
          ? removeUndefined(v)
          : v;
    }
    return acc;
  }, {} as Record<string, any>);
}

const safeFee = (value: unknown) => {
  const fee = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(fee) || fee < 0) return 0;
  return Math.floor(fee);
};

const categoryFeeFor = (categories: any[], categoryId?: string) => {
  if (!categoryId) return 0;
  const cat = categories.find((c: any) => c.id === categoryId);
  const feeFromDoc = safeFee(cat?.postingFee);
  const feeFromDefaults = safeFee(CATEGORY_POSTING_FEES[categoryId]);
  return feeFromDoc || feeFromDefaults || 0;
};

export default function CreateProjectPage() {
  const { t, currentLanguage } = useTranslationContext();
  const router = useRouter();
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "profiles", user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    };
    loadProfile();
  }, [user]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
        setCategories(cats as any[]);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    categoryId: "",
    category: null,
    timeline: "",
    skillsRequired: [],
    imageUrl: "",
    sampleImages: [],
    projectType: "client",
    maxFreelancers: 5,
    visibility: "public",
    editQuota: 3,
    budget: 0,
    postingFee: 0,
  });

  useEffect(() => {
    if (!formData.categoryId) return;
    const cat = categories.find((c: any) => c.id === formData.categoryId);
    if (!cat) return;
    const fee = categoryFeeFor(categories, formData.categoryId);
    setFormData((prev) => {
      const sameCategory = prev.category?.id === cat.id;
      const sameFee = (prev.postingFee ?? 0) === fee;
      if (sameCategory && sameFee) return prev;
      return { ...prev, category: cat, postingFee: fee };
    });
  }, [categories, formData.categoryId]);

  // Restore Draft
  useEffect(() => {
    const restore = async () => {
      if (!user) return;

      try {
        const draftRef = doc(db, "project_drafts", user.uid);
        const snap = await getDoc(draftRef);
        let data: any = null;

        if (snap.exists()) {
          data = snap.data();
          setFormData((prev) => ({ ...prev, ...data }));
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        } else {
          const saved = localStorage.getItem(LOCAL_KEY);
          if (saved) {
            data = JSON.parse(saved);
            setFormData((prev) => ({ ...prev, ...data }));
          }
        }

        setDraftLoaded(true);
      } finally {
        setDraftLoaded(true);
      }
    };

    restore();
  }, [user]);

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

  // Block freelancers
  if (!user || !userProfile || !draftLoaded) return renderSkeleton();

  const roles = userProfile.userRoles || [];
  const types = userProfile.userType || [];

  const isFreelancerOnly =
    (roles.includes("freelancer") || types.includes("freelancer")) &&
    !roles.includes("client");

  if (isFreelancerOnly) {
    return (
      <div className="max-w-xl mx-auto text-center mt-20 p-6 border border-border rounded-lg shadow">
        <h2 className="text-xl font-semibold text-error mb-2">
          {t("createProject.accessDeniedTitle") || "Access Denied"}
        </h2>

        <p className="text-text-secondary mb-4">
          {t("createProject.accessDeniedMessage") ||
            "Freelancer accounts cannot create projects."}
        </p>

        <Link href="/" className="btn btn-primary">
          {t("createProject.goBack") || "Go Back"}
        </Link>
      </div>
    );
  }

  const TITLE_MIN = 5;
  const DESC_MIN = 20;

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          formData.title.trim().length >= TITLE_MIN &&
          formData.description.trim().length >= DESC_MIN
        );
      case 1:
        return !!formData.categoryId && !!formData.timeline && formData.budget > 0;
      case 2:
        return formData.skillsRequired.length > 0 || true;
      case 3:
        return !!formData.imageUrl || true;
      default:
        return true;
    }
  };

  const resolvePostingFee = () => {
    const fee = categoryFeeFor(categories, formData.categoryId);
    return fee || safeFee(formData.postingFee);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setSaving(true);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target?.result as string;
        setFormData((p) => ({ ...p, imageUrl: url }));
        setPreviewUrl(url);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) throw new Error("Please login first");
    
    try {
      const draftRef = doc(db, "project_drafts", user.uid);
      await updateDoc(draftRef, removeUndefined(formData));
      localStorage.setItem(LOCAL_KEY, JSON.stringify(formData));
    } catch {
      const draftRef = doc(db, "project_drafts", user.uid);
      await updateDoc(draftRef, removeUndefined(formData));
      localStorage.setItem(LOCAL_KEY, JSON.stringify(formData));
    }
  };

  const handleNext = () => {
    if (canNext()) setStep(Math.min(step + 1, MAX_STEPS - 1));
  };

  const handlePrev = () => setStep(Math.max(step - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Please login first");
    if (!formData.categoryId) return setError("Select category first");

    setSaving(true);

    try {
      const pRef = doc(db, "profiles", user.uid);
      const snap = await getDoc(pRef);

      if (!snap.exists()) throw new Error("Profile not found");

      const profile = snap.data();
      const currentCredit = profile.credit ?? 0;
      
      // Fixed posting fee per category
      const postingFee = resolvePostingFee();

      if (currentCredit < postingFee)
        throw new Error("Not enough credit to post project");

      const projectRef = await addDoc(collection(db, "projects"), {
        ...removeUndefined(formData),
        // Convert timeline ID to full timeline object with both languages
        timeline: formData.timeline ? getTimelineData(formData.timeline) : null,
        postingFee,
        clientId: user.uid,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newCredit = currentCredit - postingFee;

      await updateDoc(pRef, {
        credit: newCredit,
        updatedAt: serverTimestamp(),
      });

      const transactionId = `POST-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        transactionId,
        type: "posting_fee",
        amount: postingFee,
        currency: "CREDITS",
        status: "completed",
        direction: "out",
        projectId: projectRef.id,
        createdAt: serverTimestamp(),
        previousBalance: currentCredit,
        newBalance: newCredit,
        description: `Paid ${postingFee} credits to post project "${formData.title}"`,
      });

      localStorage.removeItem(LOCAL_KEY);
      if (user) await deleteDoc(doc(db, "project_drafts", user.uid));

      router.push("/projects/manage");
    } catch (err: any) {
      setError(err.message || "Submit failed");
      setSaving(false);
    }
  };

  // Use timeline options from utility
  const timelines = TIMELINE_OPTIONS.map(option => ({
    id: option.id,
    label: currentLanguage === 'lo' ? option.label_lo : option.label_en
  }));

  const steps = [
    t("createProject.basicInformation") || "Basic Info",
    t("createProject.projectDetails") || "Details",
    t("createProject.requirements") || "Requirements",
    t("createProject.projectMedia") || "Media",
    t("createProject.reviewSubmit") || "Review",
  ];

  const categoryPostingFee = resolvePostingFee();

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stepper */}
        <ProjectStepper steps={steps} current={step} />

        {/* Content */}
        <div className="rounded-xl border border-border shadow-sm bg-background p-4 sm:p-6 mb-6 sm:mb-8 pb-24 sm:pb-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {step === 0 && <ProjectBasics formData={formData} setFormData={setFormData} t={t} />}
          {step === 1 && (
            <ProjectDetails
              formData={formData}
              setFormData={setFormData}
              t={t}
              categories={categories}
              categoriesLoading={categoriesLoading}
              timelines={timelines}
            />
          )}
          {step === 2 && <ProjectRequirements formData={formData} setFormData={setFormData} t={t} />}
          {step === 3 && (
            <ProjectMedia
              formData={formData}
              setFormData={setFormData}
              t={t}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              onImageUpload={handleImageUpload}
              uploading={saving}
            />
          )}
          {step === 4 && (
            <ProjectReview
              formData={formData}
              t={t}
              previewUrl={previewUrl}
              postingFee={categoryPostingFee}
              credits={userProfile?.credit || 0}
            />
          )}
        </div>

        {/* Save Draft Button - Floating */}
        <SaveDraftButton
          onSave={handleSaveDraft}
          label={t("createProject.saveAsDraft") || "Save as Draft"}
          successMessage={t("createProject.draftSaved") || "Draft saved successfully!"}
          errorMessage={t("createProject.saveFailed") || "Failed to save draft"}
          disabled={saving}
        />

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
          <button
            disabled={step === 0 || saving}
            onClick={handlePrev}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-border bg-background text-text-primary font-medium hover:border-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {t("createProject.previous") || "Back"}
          </button>

          {step < steps.length - 1 ? (
            <button
              disabled={!canNext() || saving}
              onClick={handleNext}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {t("createProject.next") || "Next"}
            </button>
          ) : (
            <button
              disabled={!canNext() || saving || categoryPostingFee > (userProfile?.credit || 0)}
              onClick={handleSubmit}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (t("createProject.creating") || "Creating…") : (t("createProject.createProject") || "Create Project")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
