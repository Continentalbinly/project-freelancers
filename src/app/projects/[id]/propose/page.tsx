"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import Header from "./components/Header";
import ProjectSidebar from "./components/ProjectSidebar";
import ProposalForm from "./components/ProposalForm";

export default function ProposePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslationContext();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  // Fetch project + client
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoadingProject(true);
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (!projectDoc.exists()) return router.push("/projects");

        const projectData = projectDoc.data();
        const clientDoc = await getDoc(
          doc(db, "profiles", projectData.clientId)
        );
        const client = clientDoc.exists() ? clientDoc.data() : null;

        setProject({
          id: projectDoc.id,
          ...projectData,
          client,
        });
      } catch (err) {
        router.push("/projects");
      } finally {
        setLoadingProject(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId, router]);

  if (loading || loadingProject)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary">
        <div className="animate-spin border-4 border-primary border-t-transparent rounded-full w-10 h-10"></div>
      </div>
    );

  if (!user || !project) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header t={t} router={router} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ProjectSidebar project={project} t={t} />
          <div className="lg:col-span-2">
            <ProposalForm
              project={project}
              user={user}
              profile={profile}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
