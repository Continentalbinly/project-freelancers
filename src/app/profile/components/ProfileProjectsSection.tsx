"use client";

import { useEffect, useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import ProjectCard from "@/app/projects/components/ProjectCard";
import { Briefcase } from "lucide-react";
import type { Project } from "@/types/project";

interface ProfileProjectsSectionProps {
  profileId: string;
}

export default function ProfileProjectsSection({ profileId }: ProfileProjectsSectionProps) {
  const { t } = useTranslationContext();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(requireDb(), "projects"),
      where("clientId", "==", profileId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, ...data } as Project;
        });
        setProjects(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [profileId]);

  if (loading) {
    return (
      <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
            {t("profile.projects.title") || "My Projects"}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl shadow-sm border border-border overflow-hidden animate-pulse">
              <div className="h-48 bg-background-secondary"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-background-secondary rounded w-3/4"></div>
                <div className="h-3 bg-background-secondary rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) return null;

  return (
    <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
          {t("profile.projects.projects") || "My Projects"}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            t={t}
            incrementProjectViews={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

