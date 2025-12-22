"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Project } from "@/types/project";

import ProjectSidebar from "./components/ProjectSidebar";
import ProposalForm from "./components/ProposalForm";

export default function ProposePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslationContext();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user]);

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!db) return;
        setLoadingProject(true);

        const snap = await getDoc(doc(db, "projects", projectId));
        if (!snap.exists()) return router.push("/projects");

        const data = snap.data();

        // Load client profile
        const clientSnap = await getDoc(doc(db, "profiles", data.clientId));
        const client = clientSnap.exists() ? clientSnap.data() : null;

        setProject({
          id: snap.id,
          title: data.title || "",
          description: data.description || "",
          budget: data.budget || 0,
          budgetType: data.budgetType || "fixed",
          status: data.status || "open",
          category: data.category || "",
          clientId: data.clientId || "",
          skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : [],
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          freelancerId: data.freelancerId,
          proposalsCount: data.proposalsCount,
          views: data.views,
          timeline: data.timeline,
          acceptedFreelancerId: data.acceptedFreelancerId,
          acceptedProposalId: data.acceptedProposalId,
          attachments: data.attachments,
          imageUrl: data.imageUrl,
          deadline: data.deadline,
          clientCompleted: data.clientCompleted,
          freelancerCompleted: data.freelancerCompleted,
          postingFee: data.postingFee,
          progress: data.progress,
          client: client ? {
            fullName: client.fullName || "",
            avatarUrl: client.avatarUrl || null,
            rating: client.rating || null,
          } : null,
        } as Project);
      } finally {
        setLoadingProject(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, router]);

  // LOADING SKELETON
  if (loading || loadingProject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            {/* Project Sidebar Skeleton */}
            <aside className="rounded-xl shadow-sm border border-border bg-background-secondary p-6 lg:sticky lg:top-[100px] self-start">
              <div className="h-7 bg-background-tertiary dark:bg-gray-700 rounded-lg w-40 mb-4"></div>
              
              <div className="space-y-4">
                {/* Title + Description */}
                <div>
                  <div className="h-6 bg-background-tertiary dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-background-tertiary dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>

                {/* Project Meta */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-28"></div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-6 bg-background-tertiary dark:bg-gray-700 rounded-full w-24"></div>
                    <div className="h-6 bg-background-tertiary dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                </div>

                {/* Proposal Fee */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            </aside>

            {/* Proposal Form Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Skeleton */}
              <div className="rounded-xl shadow-sm border border-border bg-background-secondary p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-background-tertiary dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-40 mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-48"></div>
                </div>
              </div>

              {/* Form Skeleton */}
              <div className="rounded-xl shadow-sm border border-border bg-background p-6 space-y-6">
                <div className="h-7 bg-background-tertiary dark:bg-gray-700 rounded-lg w-48"></div>

                {/* Cover Letter */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-32 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                </div>

                {/* Budget & Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-36 mb-2"></div>
                    <div className="h-10 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-28 mb-2"></div>
                    <div className="h-10 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-36 mb-2"></div>
                  <div className="h-10 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                </div>

                {/* Work Plan */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-28 mb-2"></div>
                  <div className="h-24 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                </div>

                {/* Work Samples Section */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-16 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-10 bg-background-tertiary dark:bg-gray-700 rounded-lg w-32"></div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-28 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-20 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-10 bg-background-tertiary dark:bg-gray-700 rounded-lg w-36"></div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="border-t border-border pt-6">
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-28"></div>
                      <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <div className="h-11 bg-background-tertiary dark:bg-gray-700 rounded-lg w-40"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !project) return null;

  const proposalFee = project.postingFee ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
    </div>
  );
}
