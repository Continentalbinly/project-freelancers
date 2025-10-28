"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
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
import GlobalStatus from "../../components/GlobalStatus"; // ✅ Global reusable component

export interface ProjectFormData {
  title: string;
  description: string;
  categoryId?: string;
  category?: {
    id: string;
    name_en: string;
    name_lo: string;
  };
  budget: string;
  budgetType: "fixed";
  timeline: string;
  skillsRequired: string[];
  deadline: string;
  imageUrl: string;
  projectType: "client" | "freelancer";
  maxFreelancers: number;
  visibility: "public" | "private";
}

export default function CreateProjectPage() {
  const { t } = useTranslationContext();
  const router = useRouter();
  const { user, profile } = useAuth();

  // 🪄 Step system
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    categoryId: "",
    category: undefined,
    budget: "",
    budgetType: "fixed",
    timeline: "",
    skillsRequired: [],
    deadline: "",
    imageUrl: "",
    projectType: "client",
    maxFreelancers: 5,
    visibility: "public",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 Step list
  const steps = [
    t("createProject.projectTypeVisibility"),
    t("createProject.basicInformation"),
    t("createProject.projectDetails"),
    t("createProject.requirements"),
    t("createProject.projectMedia"),
    t("createProject.reviewSubmit"),
  ];

  // 🔹 Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.projectType && formData.maxFreelancers > 0;
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

  const nextStep = () =>
    currentStep < steps.length && setCurrentStep((s) => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  // ✅ Handle project creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in.");
    if (!formData.category || !formData.categoryId)
      return setError("Please select a category before submitting.");

    setLoading(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) throw new Error("Profile not found.");

      const userData = profileSnap.data();
      const currentCredit = userData.credit ?? 0;
      const projectBudget = Number(formData.budget);

      if (currentCredit < projectBudget) {
        setError("Not enough credit to create this project.");
        setLoading(false);
        return;
      }

      // ➕ Add project
      const projectRef = await addDoc(collection(db, "projects"), {
        title: formData.title,
        description: formData.description,
        categoryId: formData.category.id,
        category: formData.category,
        budget: projectBudget,
        budgetType: formData.budgetType,
        timeline: formData.timeline,
        skillsRequired: formData.skillsRequired,
        deadline: formData.deadline || null,
        imageUrl: formData.imageUrl,
        projectType: formData.projectType,
        maxFreelancers: formData.maxFreelancers,
        visibility: formData.visibility,
        userId: user.uid,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 💰 Deduct credit
      const newCredit = currentCredit - projectBudget;
      await updateDoc(profileRef, {
        credit: newCredit,
        updatedAt: serverTimestamp(),
      });

      // 🧾 Add transaction record
      const transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        transactionId,
        type: "project_creation",
        amount: projectBudget,
        currency: "LAK",
        status: "completed",
        paymentMethod: "credit_balance",
        projectId: projectRef.id,
        createdAt: serverTimestamp(),
        previousBalance: currentCredit,
        newBalance: newCredit,
        description: `Created project "${formData.title}"`,
      });

      router.push("/projects");
    } catch (err) {
      console.error("❌ Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Access guard logic
  if (!user)
    return (
      <GlobalStatus
        type="loading"
        message={t("common.loadingUser") || "Loading your account..."}
      />
    );

  if (!user.emailVerified)
    return (
      <GlobalStatus
        type="verify"
        message={
          t("auth.verifyEmailMsg") || "Please verify your email to continue."
        }
      />
    );

  const isFreelancerOnly = Array.isArray(profile?.userType)
    ? profile.userType.length === 1 && profile.userType[0] === "freelancer"
    : profile?.userType === "freelancer";

  if (isFreelancerOnly)
    return (
      <GlobalStatus
        type="denied"
        message={
          t("auth.accessDenied") || "Only clients can create new projects."
        }
      />
    );

  // 🧭 Page UI
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/projects" className="text-primary hover:underline">
            {t("createProject.projects")}
          </Link>{" "}
          / {t("createProject.createProject")}
        </nav>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border">
          <StepProgress currentStep={currentStep} steps={steps} />

          <div className="p-6">
            {/* Steps */}
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
              <Step3Details
                formData={formData}
                setFormData={setFormData}
                t={t}
              />
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

            {/* Navigation */}
            <NavigationButtons
              currentStep={currentStep}
              stepsLength={steps.length}
              isStepValid={!!isStepValid(currentStep)}
              nextStep={nextStep}
              prevStep={prevStep}
              loading={loading}
              handleSubmit={handleSubmit}
              t={t}
              projectBudget={Number(formData.budget)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
