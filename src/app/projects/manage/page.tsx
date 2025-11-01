"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const { user, profile } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    search: "",
  });

  const shouldBlock = Array.isArray(profile?.userType)
    ? profile.userType.length === 1 && profile.userType[0] === "freelancer"
    : profile?.userType === "freelancer";

  useEffect(() => {
    if (shouldBlock) {
      const timeout = setTimeout(() => router.push("/"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [shouldBlock]);

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      if (!user) return;
      setLoading(true);

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
      setLoading(false);
    }
  };

  if (shouldBlock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {t("createProject.permissionDenied")}
          </h2>
          <p className="text-text-secondary mb-6">
            {t("createProject.permissionDeniedMessage")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("createProject.redirecting")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ManageProjectsHeader t={t} router={router} />
        <ManageProjectsFilters
          t={t}
          filters={filters}
          setFilters={setFilters}
        />

        {loading ? (
          <ManageProjectsSkeleton t={t} />
        ) : (
          <ManageProjectsList projects={projects} filters={filters} t={t} />
        )}
      </div>
    </div>
  );
}
