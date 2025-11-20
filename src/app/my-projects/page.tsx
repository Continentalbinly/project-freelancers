"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import ProjectCard from "./components/ProjectCard";
import type { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { t } = useTranslationContext();

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        // 🔹 Queries for client + freelancer roles
        const clientQ = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid)
        );
        const freelancerQ = query(
          collection(db, "projects"),
          where("acceptedFreelancerId", "==", user.uid)
        );

        // 🧩 Fetch both sets in parallel
        const [clientSnap, freelancerSnap] = await Promise.all([
          getDocs(clientQ),
          getDocs(freelancerQ),
        ]);

        // Merge unique projects
        const allDocs = [...clientSnap.docs, ...freelancerSnap.docs];
        const uniqueProjects: Project[] = Array.from(
          new Map(
            allDocs.map((d) => {
              const data = d.data() as Omit<Project, "id">;
              return [d.id, { ...data, id: d.id } as Project];
            })
          ).values()
        );

        // 🕒 Sort by createdAt DESC (latest first)
        uniqueProjects.sort((a, b) => {
          const aTime =
            (a.createdAt as any)?.toMillis?.() ||
            new Date(a.createdAt || 0).getTime();
          const bTime =
            (b.createdAt as any)?.toMillis?.() ||
            new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });

        // 📇 Collect profile IDs to fetch
        const profileIds = Array.from(
          new Set(
            uniqueProjects.flatMap((p) => [p.clientId, p.acceptedFreelancerId])
          )
        ).filter((id): id is string => typeof id === "string" && !!id);

        // 🔹 Fetch related profiles
        const profileDocs = await Promise.all(
          profileIds.map(async (pid) => {
            try {
              const ref = doc(db, "profiles", pid);
              const snap = await getDoc(ref);
              return snap.exists() ? { id: snap.id, ...snap.data() } : null;
            } catch {
              return null;
            }
          })
        );

        const profileMap: Record<string, any> = {};
        profileDocs.forEach((profile) => {
          if (profile) profileMap[profile.id] = profile;
        });

        setProfiles(profileMap);
        setProjects(uniqueProjects);
      } catch (err) {
        //console.error("❌ Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  /* ----------------------------- 🌀 LOADING UI ----------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary text-sm sm:text-base">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  /* ------------------------------ 🫥 EMPTY UI ------------------------------ */
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <img
          src="/empty-state.png"
          alt="No projects"
          className="w-48 h-48 mb-6 opacity-90 drop-shadow-sm"
        />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {t("common.NoProjectsYet")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          {t("common.NoProjectsYetDesc")}
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 cursor-pointer py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-sm"
        >
          {t("common.browseProject")}
        </button>
      </div>
    );
  }

  /* ------------------------------ ✅ MAIN UI ------------------------------ */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-2xl font-bold mb-8">
        {t("myProjects.title")}
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} currentUserId={user?.uid ?? ""} />
        ))}
      </div>
    </div>
  );
}
