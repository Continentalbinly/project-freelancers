"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import ProjectCard from "./components/ProjectCard";
import type { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import MyProjectsSkeleton from "./components/MyProjectsSkeleton";
import { Timestamp } from "firebase/firestore";
import { convertTimestamp } from "@/service/firebase";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { t } = useTranslationContext();

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        // 🔹 Queries for client + freelancer roles
        const clientQ = query(
          collection(requireDb(), "projects"),
          where("clientId", "==", user.uid)
        );
        const freelancerQ = query(
          collection(requireDb(), "projects"),
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
          const aTime = a.createdAt instanceof Timestamp
            ? a.createdAt.toMillis()
            : a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : new Date(a.createdAt || 0).getTime();
          const bTime = b.createdAt instanceof Timestamp
            ? b.createdAt.toMillis()
            : b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : new Date(b.createdAt || 0).getTime();
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
              const ref = doc(requireDb(), "profiles", pid);
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
      } catch  {
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <MyProjectsSkeleton />
        </div>
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
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          {t("common.NoProjectsYet")}
        </h2>
        <p className="text-text-secondary mb-6 max-w-sm">
          {t("common.NoProjectsYetDesc")}
        </p>
        <Link
          href="/"
          className="inline-block px-6 cursor-pointer py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-sm"
        >
          {t("common.browseProject")}
        </Link>
      </div>
    );
  }

  /* ------------------------------ ✅ MAIN UI ------------------------------ */
  const filteredProjects = projects.filter((p) => {
    if (activeFilter === "all") return true;
    return p.status === activeFilter;
  });

  const filterTabs = [
    { key: "all", label: t("myProjects.filters.all") || "All", count: projects.length },
    { key: "in_progress", label: t("myProjects.filters.inProgress") || "In Progress", count: projects.filter(p => p.status === "in_progress").length },
    { key: "completed", label: t("myProjects.filters.completed") || "Completed", count: projects.filter(p => p.status === "completed").length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            {t("myProjects.title")}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            {t("myProjects.subtitle") || "Manage and track all your projects in one place"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 sm:gap-3 border-b border-border pb-1 min-w-max">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-t-lg font-medium text-sm sm:text-base transition-all whitespace-nowrap ${
                  activeFilter === tab.key
                    ? "bg-background text-primary border-b-2 border-primary shadow-sm"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-background-tertiary text-text-secondary"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary">
              {t("myProjects.noProjectsInFilter") || "No projects found with this filter"}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProjects.map((p) => (
              <ProjectCard key={p.id} project={p} currentUserId={user?.uid ?? ""} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
