"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import StepProgress from "./components/StepProgress";
import NavigationButtons from "./components/NavigationButtons";
import Step1ProjectType from "./components/Step1ProjectType";
import Step2BasicInfo from "./components/Step2BasicInfo";
import Step3Details from "./components/Step3Details";
import Step4Requirements from "./components/Step4Requirements";
import Step5Media from "./components/Step5Media";
import Step6Review from "./components/Step6Review";
import GlobalStatus from "../../components/GlobalStatus";

// Utility to recursively remove undefined fields
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

// Form data interface
export interface ProjectFormData {
  title: string;
  description: string;
  categoryId?: string;
  category?: { id: string; name_en: string; name_lo: string } | null;
  budget: string;
  budgetType: "fixed";
  timeline: string;
  skillsRequired: string[];
  deadline: string;
  imageUrl: string;
  sampleImages?: string[];
  projectType: "client";
  maxFreelancers: number;
  visibility: "public" | "private";
  editQuota?: number;
}

const LOCAL_KEY = "createProjectFormData";
const MAX_STEPS = 6;

export default function CreateProjectPage() {
  const { t } = useTranslationContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    categoryId: "",
    category: null,
    budget: "",
    budgetType: "fixed",
    timeline: "",
    skillsRequired: [],
    deadline: "",
    imageUrl: "",
    sampleImages: [],
    projectType: "client",
    maxFreelancers: 5,
    visibility: "public",
    editQuota: 3,
  });

  const [loading, setLoading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Safe helper to update ?step param AFTER render
  const updateURLStep = (step: number) => {
    queueMicrotask(() => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("step", step.toString());
        window.history.replaceState({}, "", url);
      } catch (_) {}
    });
  };

  const clampStep = (s: number) => Math.min(Math.max(s, 1), MAX_STEPS);

  // ✅ Step validation rules
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.maxFreelancers > 0;
      case 2:
        return !!formData.title.trim() && !!formData.description.trim();
      case 3:
        return (
          !!formData.categoryId &&
          !!formData.category &&
          !!formData.budget &&
          !!formData.timeline
        );
      default:
        return true;
    }
  };

  // ✅ Restore draft
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

        const paramStep = Number(searchParams.get("step"));
        const next = clampStep(paramStep || data?.step || 1);

        setCurrentStep(next);
        updateURLStep(next);
      } catch (err) {
        console.error("⚠️ restore draft error:", err);
      } finally {
        setDraftLoaded(true);
      }
    };
    restore();
  }, [user]);

  // ✅ Validate + clamp steps
  useEffect(() => {
    if (!draftLoaded) return;
    setTimeout(() => {
      let validUntil = 1;
      for (let i = 1; i <= MAX_STEPS; i++) {
        if (!isStepValid(i)) break;
        validUntil = i;
      }
      setCurrentStep((prev) => {
        const corrected = clampStep(Math.min(prev, validUntil + 1));
        updateURLStep(corrected);
        return corrected;
      });
    }, 100);
  }, [formData, draftLoaded]);

  // ✅ Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(LOCAL_KEY, JSON.stringify(formData));
  }, [formData]);

  // ✅ Sync draft step to Firestore
  useEffect(() => {
    if (!draftLoaded) return;
    updateURLStep(clampStep(currentStep));
    if (user) {
      const syncStep = async () => {
        try {
          const cleaned = removeUndefined(formData);
          await setDoc(doc(db, "project_drafts", user.uid), {
            ...cleaned,
            step: clampStep(currentStep),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn("⚠️ sync step failed:", err);
        }
      };
      syncStep();
    }
  }, [currentStep, draftLoaded]);

  // ✅ Auto-sync every 10s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const cleaned = removeUndefined(formData);
        await setDoc(doc(db, "project_drafts", user.uid), {
          ...cleaned,
          step: clampStep(currentStep),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("⚠️ autosync failed:", err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user, formData, currentStep]);

  // ✅ Navigation helpers
  const goToStep = (s: number) => {
    const clamped = clampStep(s);
    if (clamped <= currentStep || isStepValid(clamped - 1)) {
      setCurrentStep(clamped);
      updateURLStep(clamped);
    }
  };
  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  // ✅ Clear draft
  const clearLocalForm = async () => {
    localStorage.removeItem(LOCAL_KEY);
    if (user) await deleteDoc(doc(db, "project_drafts", user.uid));
  };

  // ✅ Submit with transaction + escrow log
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Please login first");
    if (!formData.categoryId) return setError("Select category before submit");

    setLoading(true);
    try {
      const pRef = doc(db, "profiles", user.uid);
      const snap = await getDoc(pRef);
      if (!snap.exists()) throw new Error("Profile not found");

      const data = snap.data();
      const currentCredit = data.credit ?? 0;
      const projectBudget = Number(formData.budget);
      if (currentCredit < projectBudget) throw new Error("Not enough credit");

      // ➕ Create project doc
      const projectRef = await addDoc(collection(db, "projects"), {
        ...removeUndefined(formData),
        budget: projectBudget,
        clientId: user.uid,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newCredit = currentCredit - projectBudget;
      await updateDoc(pRef, {
        credit: newCredit,
        updatedAt: serverTimestamp(),
      });

      // 🧾 Log transaction
      const transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        transactionId,
        type: "escrow_hold",
        amount: projectBudget,
        currency: "LAK",
        status: "held",
        direction: "out",
        paymentMethod: "credit_balance",
        projectId: projectRef.id,
        createdAt: serverTimestamp(),
        previousBalance: currentCredit,
        newBalance: newCredit,
        description: `Held ${projectBudget} LAK for project "${formData.title}"`,
      });

      // 💼 Escrow record
      await addDoc(collection(db, "escrows"), {
        projectId: projectRef.id,
        clientId: user.uid,
        freelancerId: null,
        amount: projectBudget,
        status: "held",
        createdAt: serverTimestamp(),
      });

      await clearLocalForm();
      router.push("/projects");
    } catch (err: any) {
      console.error("❌ Failed to create project:", err);
      setError(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  // Guards
  if (!user)
    return <GlobalStatus type="loading" message={t("common.loadingUser")} />;
  if (!draftLoaded)
    return <GlobalStatus type="loading" message={t("common.draftLoaded")} />;

  const steps = [
    t("createProject.projectTypeVisibility"),
    t("createProject.basicInformation"),
    t("createProject.projectDetails"),
    t("createProject.requirements"),
    t("createProject.projectMedia"),
    t("createProject.reviewSubmit"),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-primary hover:underline">
          {t("header.home")}
        </Link>{" "}
        / {t("createProject.createProject")}
      </nav>

      <div className="bg-white rounded-lg shadow-sm border border-border">
        <StepProgress currentStep={currentStep} steps={steps} />
        <div className="p-6">
          {currentStep === 1 && (
            <Step1ProjectType
              formData={formData}
              setFormData={setFormData}
              t={t}
            />
          )}
          {currentStep === 2 && (
            <Step2BasicInfo
              formData={formData}
              setFormData={setFormData}
              t={t}
            />
          )}
          {currentStep === 3 && (
            <Step3Details formData={formData} setFormData={setFormData} t={t} />
          )}
          {currentStep === 4 && (
            <Step4Requirements
              formData={formData}
              setFormData={setFormData}
              t={t}
            />
          )}
          {currentStep === 5 && (
            <Step5Media
              formData={formData}
              setFormData={setFormData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              fileInputRef={fileInputRef}
              t={t}
            />
          )}
          {currentStep === 6 && (
            <Step6Review formData={formData} previewUrl={previewUrl} t={t} />
          )}

          <NavigationButtons
            currentStep={currentStep}
            stepsLength={MAX_STEPS}
            isStepValid={isStepValid(currentStep)}
            nextStep={nextStep}
            prevStep={prevStep}
            loading={loading}
            handleSubmit={handleSubmit}
            t={t}
            projectBudget={Number(formData.budget)}
          />

          <div className="text-right mt-4">
            <button
              onClick={clearLocalForm}
              className="text-xs text-red-500 hover:underline"
            >
              {t("createProject.clearDraft") || "Clear saved draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
