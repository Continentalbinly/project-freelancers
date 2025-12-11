"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc as firestoreDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { deleteProjectImage } from "@/app/utils/projectImageHandler";

import LoadingState from "./components/LoadingState";
import EditForm from "./components/EditForm";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "fixed";
  skillsRequired: string[];
  status: string;
  category: string;
  clientId: string;
  timeline?: string;
  imageUrl?: string;
}

export default function EditProjectPage() {
  const { t } = useTranslationContext();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const projectId = id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [error, setError] = useState("");

  // redirect if unauthenticated
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!user || !projectId) return;
        const docSnap = await getDoc(firestoreDoc(db, "projects", projectId));
        if (!docSnap.exists()) {
          router.push("/projects/manage");
          return;
        }

        const data = docSnap.data() as Project;
        if (data.clientId !== user.uid) {
          router.push("/projects/manage");
          return;
        }

        if (["completed", "cancelled"].includes(data.status)) {
          router.push(`/projects/${projectId}`);
          return;
        }

        setProject({ ...data, id: projectId });
      } catch (err) {
        //console.error(err);
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProject();
  }, [user, projectId, router]);

  if (loading || loadingProject) return <LoadingState t={t} />;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg shadow-sm border border-border hover:shadow-md transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5  " />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold  ">
              {t("editProject.title")}
            </h1>
            <p className="text-text-secondary">
              {t("editProject.updateProjectDetails")}
            </p>
          </div>
        </div>

        {/* Form */}
        <EditForm
          project={project}
          user={user}
          t={t}
          deleteProjectImage={deleteProjectImage}
        />
      </div>
    </div>
  );
}
