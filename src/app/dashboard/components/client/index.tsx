"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import type { Project } from "@/types/project";
import StatsGrid from "../StatsGrid";
import QuickActions from "../QuickActions";
import RecentProjects from "../RecentProjects";

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();

  // Memoize query to prevent unnecessary recalculations
  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, "projects"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(6)
    );
  }, [user]);

  // Use optimized query hook with caching
  const { data: projects = [], loading: dataLoading } = useFirestoreQuery<Project>(
    `client_projects_${user?.uid}`,
    projectsQuery,
    {
      enabled: !!user,
      ttl: 3 * 60 * 1000, // 3 minutes
      dependencies: [user?.uid],
    }
  );

  // Compute stats from projects
  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        activeProjects: 0,
        completedProjects: 0,
        credit: 0,
      };
    }

    const active = projects.filter(
      (p: any) => p.status === "open" || p.status === "in_progress"
    ).length;
    const completed = projects.filter((p: any) => p.status === "completed").length;

    return {
      activeProjects: active,
      completedProjects: completed,
      credit: profile?.credit || 0,
    };
  }, [projects, profile?.credit]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary via-secondary to-secondary-hover text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            {t("welcome")}, {profile?.fullName?.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/90 text-lg">
            {t("clientDashboard.subtitle") || "Manage your projects and hire freelancers"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StatsGrid stats={stats} />
        <QuickActions variant="client" />
        <RecentProjects projects={projects} isLoading={dataLoading} />
      </div>
    </div>
  );
}
