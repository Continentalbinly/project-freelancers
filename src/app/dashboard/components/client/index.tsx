"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import type { Project } from "@/types/project";
import StatsGrid from "../StatsGrid";
import QuickActions from "../QuickActions";
import RecentProjects from "../RecentProjects";

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();
  const [liveCredit, setLiveCredit] = useState<number>(profile?.credit || 0);

  // Real-time credit listener for instant updates after topup/transactions
  useEffect(() => {
    if (!user?.uid) {
      setLiveCredit(profile?.credit || 0);
      return;
    }

    const profileRef = doc(requireDb(), "profiles", user.uid);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const credit = data?.credit ?? 0;
          setLiveCredit(credit);
        } else {
          setLiveCredit(profile?.credit || 0);
        }
      },
      (error) => {
        // Fallback to profile credit on error
        setLiveCredit(profile?.credit || 0);
      }
    );

    // Initialize with current profile credit
    setLiveCredit(profile?.credit || 0);

    return () => {
      unsubscribe();
    };
  }, [user?.uid, profile?.credit]);

  // Memoize query to prevent unnecessary recalculations
  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(requireDb(), "projects"),
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
        credit: liveCredit,
      };
    }

    const active = projects.filter(
      (p: Project) => p.status === "open" || p.status === "in_progress"
    ).length;
    const completed = projects.filter((p: Project) => p.status === "completed").length;

    return {
      activeProjects: active,
      completedProjects: completed,
      credit: liveCredit,
    };
  }, [projects, liveCredit]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-linear-to-r from-secondary via-secondary to-secondary-hover text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
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
        <RecentProjects projects={projects || []} isLoading={dataLoading} />
      </div>
    </div>
  );
}
