"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";

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
  }, [loading, user]);

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoadingProject(true);

        const snap = await getDoc(doc(db, "projects", projectId));
        if (!snap.exists()) return router.push("/projects");

        const data = snap.data();

        // Load client profile
        const clientSnap = await getDoc(doc(db, "profiles", data.clientId));
        const client = clientSnap.exists() ? clientSnap.data() : null;

        setProject({
          id: snap.id,
          ...data,
          client,
        });
      } finally {
        setLoadingProject(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, router]);

  // LOADING
  if (loading || loadingProject)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );

  if (!user || !project) return null;

  const proposalFee = project.postingFee ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProjectSidebar project={project} t={t} />

        <div className="lg:col-span-2">
          <ProposalForm
            project={project}
            profile={profile}
            user={user}
            t={t}
            proposalFee={proposalFee}
          />
        </div>
      </div>
    </div>
  );
}
