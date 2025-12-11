"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import type { Project } from "@/types/project";
import StatsGrid from "../StatsGrid";
import QuickActions from "../QuickActions";
import RecentProjects from "../RecentProjects";

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { t } = useTranslationContext();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    credit: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // 📊 Load CLIENT dashboard data
  useEffect(() => {
    if (!user) return;

    const loadClientData = async () => {
      try {
        const projectsQ = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const projectsSnap = await getDocs(projectsQ);
        const projects = projectsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];

        const active = projects.filter((p) => p.status === "open" || p.status === "in_progress").length;
        const completed = projects.filter((p) => p.status === "completed").length;

        setMyProjects(projects);
        setStats({
          activeProjects: active,
          completedProjects: completed,
          credit: profile?.credit || 0,
        });
      } catch (err) {
        console.error("Error loading client data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadClientData();
  }, [user, profile?.credit]);

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
        <RecentProjects projects={myProjects} isLoading={dataLoading} />
      </div>
    </div>
  );
}
