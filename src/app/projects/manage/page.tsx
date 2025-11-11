"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Project } from "@/types/project";

import ManageProjectsHeader from "./components/ManageProjectsHeader";
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

  // 🧠 Determine if user is a freelancer
  const isFreelancer = Array.isArray(profile?.userType)
    ? profile.userType.includes("freelancer") && profile.userType.length === 1
    : profile?.userType === "freelancer";

  // 🔐 Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // 🚀 Fetch projects if user is client
  useEffect(() => {
    if (user && !isFreelancer) {
      fetchProjects();
    }
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
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // 🚫 Freelancer view (no redirect)
  if (isFreelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {t("createProject.permissionDenied") || "Permission Denied"}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("createProject.permissionDeniedMessage") ||
              "Only clients can manage projects. Please switch to a client account."}
          </p>
          <p className="text-xs text-text-secondary">
            {t("createProject.contactSupport") ||
              "If you believe this is an error, contact support."}
          </p>
        </div>
      </div>
    );
  }

  // 💬 Show loading while auth or projects are loading
  if (loading || loadingProjects) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("projects.loading")}</p>
      </div>
    );
  }

  // 🧾 Client view
  return (
    <div className="bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ManageProjectsHeader t={t} router={router} />
        <ManageProjectsFilters
          t={t}
          filters={filters}
          setFilters={setFilters}
        />
        <ManageProjectsList projects={projects} filters={filters} t={t} />
      </div>
    </div>
  );
}
