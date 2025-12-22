"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc as firestoreDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { TIMELINE_OPTIONS, getTimelineData } from "@/service/timelineUtils";

import ProjectStepper from "../../components/ProjectStepper";
import ProjectBasics from "../../components/ProjectSteps/ProjectBasics";
import ProjectDetails from "../../components/ProjectSteps/ProjectDetails";
import ProjectRequirements from "../../components/ProjectSteps/ProjectRequirements";
import ProjectMedia from "../../components/ProjectSteps/ProjectMedia";
import ProjectReview from "../../components/ProjectSteps/ProjectReview";
import GlobalStatus from "../../../../components/GlobalStatus";

import type { ProjectFormData } from "../../components/ProjectSteps/ProjectBasics";
import type { Category } from "@/types/category";

const MAX_STEPS = 5;

export default function EditProjectPage() {
  const { t, currentLanguage } = useTranslationContext();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const projectId = id as string;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

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

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [user, authLoading, router]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const firestore = requireDb();
        const snap = await getDocs(collection(firestore, "categories"));
        const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
        setCategories(cats);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Fetch project and populate form
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!user || !projectId) return;
        const firestore = requireDb();

        const docSnap = await getDoc(firestoreDoc(firestore, "projects", projectId));
        if (!docSnap.exists()) {
          router.push("/projects");
          return;
        }

        const project = docSnap.data();

        // Check authorization
        if (project.clientId !== user.uid) {
          router.push("/projects");
          return;
        }

        // Block editing completed/cancelled projects
        if (["completed", "cancelled"].includes(project.status)) {
          router.push(`/projects/${projectId}`);
          return;
        }

        const timelineValue = typeof project.timeline === 'object' && project.timeline?.id 
          ? project.timeline.id 
          : project.timeline || "";

        setFormData((prev: ProjectFormData) => ({
          ...prev,
          title: project.title || "",
          description: project.description || "",
          categoryId: project.categoryId || "",
          category: project.category || null,
          timeline: timelineValue,
          skillsRequired: project.skillsRequired || [],
          imageUrl: project.imageUrl || "",
          sampleImages: project.sampleImages || [],
          budget: project.budget || 0,
          maxFreelancers: project.maxFreelancers || 5,
          editQuota: project.editQuota || 3,
          visibility: project.visibility || "public",
        }));

        if (project.imageUrl) {
          setPreviewUrl(project.imageUrl);
        }
      } catch {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, projectId, router]);

  if (authLoading || loading)
    return <GlobalStatus type="loading" message={t("common.loading")} />;

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          formData.title.trim().length >= 3 &&
          formData.description.trim().length >= 20
        );
      case 1:
        return !!formData.categoryId && !!formData.timeline && formData.budget > 0;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };


  const handleNext = () => {
    if (canNext()) setStep(Math.min(step + 1, MAX_STEPS - 1));
  };

  const handlePrev = () => setStep(Math.max(step - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Please login first");
    if (!projectId) return setError("Project not found");
    if (!formData.categoryId) return setError("Select category first");

    setSaving(true);

    try {
      const firestore = requireDb();
      const projectRef = firestoreDoc(firestore, "projects", projectId);

      await updateDoc(projectRef, {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        category: formData.category,
        // Convert timeline ID to full timeline object with both languages
        timeline: formData.timeline ? getTimelineData(formData.timeline) : null,
        skillsRequired: formData.skillsRequired,
        imageUrl: formData.imageUrl,
        sampleImages: formData.sampleImages,
        budget: formData.budget,
        maxFreelancers: formData.maxFreelancers,
        editQuota: formData.editQuota,
        visibility: formData.visibility,
        updatedAt: serverTimestamp(),
      });

      router.push("/projects");
      } catch {
      setSaving(false);
      setError("Update failed");
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

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {t("editProject.title") || "Edit Project"}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              {t("editProject.updateProjectDetails") || "Update your project details"}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <ProjectStepper steps={steps} current={step} />

        {/* Content */}
        <div className="rounded-xl border border-border shadow-sm bg-background p-4 sm:p-6 mb-6 sm:mb-8">
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
              uploading={saving}
            />
          )}
          {step === 4 && (
            <ProjectReview
              formData={formData}
              t={t}
              previewUrl={previewUrl}
              postingFee={0}
              credits={0}
              isEdit={true}
            />
          )}
        </div>

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
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {t("createProject.next") || "Next"}
            </button>
          ) : (
            <button
              disabled={!canNext() || saving}
              onClick={handleSubmit}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-linear-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? (t("editProject.saving") || "Saving…") : (t("editProject.saveChanges") || "Save Changes")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
