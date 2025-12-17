"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Project } from "@/types/project";

import ManageProjectsFilters from "./components/ManageProjectsFilters";
import ManageProjectsList from "./components/ManageProjectsList";
import ManageProjectsSkeleton from "./components/ManageProjectsSkeleton";

export default function ManageProjectsPage() {
  const { t } = useTranslationContext();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  });

  // Identify freelancer
  const isFreelancer = profile?.role === "freelancer";

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // Load projects for clients
  useEffect(() => {
    if (user && !isFreelancer) fetchProjects();
  }, [user, isFreelancer]);

  const fetchProjects = async () => {
    try {
      if (!user) return;
      setLoadingProjects(true);

      const projectsRef = collection(db, "projects");
      const projectsQuery = query(
        projectsRef,
        where("clientId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(projectsQuery);

      const data: Project[] = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const proposalsSnap = await getDocs(
            query(
              collection(db, "proposals"),
              where("projectId", "==", docSnap.id)
            )
          );
          return {
            id: docSnap.id,
            ...data,
            proposalsCount: proposalsSnap.size,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Project;
        })
      );

      setProjects(data);
    } finally {
      setLoadingProjects(false);
    }
  };

  if (isFreelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("createProject.permissionDenied")}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ManageProjectsFilters
          t={t}
          filters={filters}
          setFilters={setFilters}
        />

        {loading || loadingProjects ? (
          <ManageProjectsSkeleton t={t} />
        ) : (
          <ManageProjectsList
            projects={projects}
            filters={filters}
            t={t}
            onProjectDeleted={(id: string) => {
              setProjects((prev) => prev.filter((p) => p.id !== id));
              fetchProjects();
            }}
          />
        )}
      </div>
    </div>
  );
}
