"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import ProjectCard from "./components/ProjectCard";
import type { Project } from "@/types/project";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import MyProjectsSkeleton from "./components/MyProjectsSkeleton";
import { Timestamp } from "firebase/firestore";
import { Package, Clock, CheckCircle, DollarSign } from "lucide-react";
import Input from "@/app/components/ui/Input";
import EmptyState from "@/app/components/ui/EmptyState";
import { type ProjectStatus } from "@/app/lib/workflow/status";

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | "all">("all");
  const [searchText, setSearchText] = useState("");
  const { t } = useTranslationContext();

  // Helper: treats t(key) === key as missing translation
  const tr = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

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

  /* ------------------------------ ✅ STATS ------------------------------ */
  const stats = useMemo(
    () => ({
      total: projects.length,
      open: projects.filter((p) => p.status === "open").length,
      inProgress: projects.filter((p) => p.status === "in_progress").length,
      inReview: projects.filter((p) => p.status === "in_review").length,
      awaitingPayment: projects.filter((p) => p.status === "payout_project").length,
      completed: projects.filter((p) => p.status === "completed").length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    }),
    [projects]
  );

  /* ------------------------------ ✅ FILTERED PROJECTS ------------------------------ */
  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const statusMatch = activeFilter === "all" || p.status === activeFilter;
        const searchMatch = p.title
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
        return statusMatch && searchMatch;
      }),
    [projects, activeFilter, searchText]
  );

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
          {tr("common.NoProjectsYet", "No projects yet")}
        </h2>
        <p className="text-text-secondary mb-6 max-w-sm">
          {tr("common.NoProjectsYetDesc", "You haven't started any projects yet. Once you post or accept one, it'll appear here!")}
        </p>
        <Link
          href="/"
          className="inline-block px-6 cursor-pointer py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-all shadow-sm"
        >
          {tr("common.browseProject", "Browse Project")}
        </Link>
      </div>
    );
  }

  /* ------------------------------ ✅ FILTER TABS ------------------------------ */
  const filterTabs = [
    {
      key: "all" as const,
      label: tr("myProjects.filters.all", "All"),
      count: projects.length,
    },
    {
      key: "open" as ProjectStatus,
      label: tr("myProjects.filters.open", "Open"),
      count: stats.open,
    },
    {
      key: "in_progress" as ProjectStatus,
      label: tr("myProjects.filters.inProgress", "In Progress"),
      count: stats.inProgress,
    },
    {
      key: "in_review" as ProjectStatus,
      label: tr("myProjects.filters.inReview", "In Review"),
      count: stats.inReview,
    },
    {
      key: "payout_project" as ProjectStatus,
      label: tr("myProjects.filters.awaitingPayment", "Awaiting Payment"),
      count: stats.awaitingPayment,
    },
    {
      key: "completed" as ProjectStatus,
      label: tr("myProjects.filters.completed", "Completed"),
      count: stats.completed,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-text-primary">
            {tr("myProjects.title", "My Projects")}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            {tr("myProjects.subtitle", "Manage and track all your projects in one place")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">
                  {tr("myProjects.stats.total", "Total Projects")}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">
                  {tr("myProjects.stats.inProgress", "In Progress")}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">
                  {tr("myProjects.stats.completed", "Completed")}
                </p>
                <p className="text-2xl font-bold text-success">
                  {stats.completed}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-background-secondary">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-secondary text-sm mb-1">
                  {tr("myProjects.stats.totalBudget", "Total Budget")}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  ₭{stats.totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={tr("myProjects.searchPlaceholder", "Search projects by title…")}
            fullWidth
          />
        </div>

        {/* Filter Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeFilter === tab.key
                  ? "bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                  : "bg-background border-2 border-border text-text-primary hover:border-primary/30"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
              <span className="hidden sm:inline">({tab.count})</span>
              <span className="sm:hidden text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            title={tr("myProjects.noProjectsInFilter", "No projects found")}
            description={
              searchText || activeFilter !== "all"
                ? tr("myProjects.noProjectsInFilterDesc", "Try adjusting your search or filters")
                : tr("myProjects.noProjectsDesc", "Get started by creating your first project")
            }
            action={
              projects.length === 0
                ? {
                    label: tr("common.browseProject", "Browse Projects"),
                    onClick: () => (window.location.href = "/projects"),
                    variant: "primary" as const,
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                currentUserId={user?.uid ?? ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
