"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/service/firebase";
import ProjectImage, {
  getProjectImageProps,
} from "@/app/utils/projectImageHandler";
import Avatar from "@/app/utils/avatarHandler";

export default function ClientsPage() {
  const { t } = useTranslationContext();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<{ [id: string]: any }>({});

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) return null;

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const q = query(collection(db, "projects"));
      const snap = await getDocs(q);
      const projectList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Fetch creator profiles in batches of 10 (Firestore 'in' limitation)
  useEffect(() => {
    if (projects.length === 0) return;
    const creatorIds = Array.from(
      new Set(projects.map((p) => p.userId || p.clientId).filter(Boolean))
    );
    if (creatorIds.length === 0) return;

    const fetchProfiles = async () => {
      let allProfiles: { [id: string]: any } = {};
      for (let i = 0; i < creatorIds.length; i += 10) {
        const batch = creatorIds.slice(i, i + 10);
        const q = query(
          collection(db, "profiles"),
          where("__name__", "in", batch)
        );
        const snap = await getDocs(q);
        snap.forEach((doc) => {
          allProfiles[doc.id] = doc.data();
        });
      }
      setProfiles(allProfiles);
    };
    fetchProfiles();
  }, [projects]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      open: {
        color: "bg-green-100 text-green-800",
        label: t("projects.statuses.open"),
      },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: t("projects.statuses.inProgress"),
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        label: t("projects.statuses.completed"),
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: t("projects.statuses.cancelled"),
      },
    };
    const s = statusMap[status] || { color: "text-gray-800", label: status };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${s.color}`}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-secondary-hover to-info dark:from-secondary/90 dark:via-secondary dark:to-secondary-hover py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t("clientsPage.hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              {t("clientsPage.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup?type=client"
                className="btn bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
              >
                {t("clientsPage.hero.postProject")}
              </Link>
              <Link
                href="/projects"
                className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold shadow-lg"
              >
                {t("clientsPage.hero.browseFreelancers")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section (like Portfolio for clients) */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("clientsPage.projects.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t("clientsPage.projects.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-background rounded-xl shadow-lg border border-border overflow-hidden animate-pulse"
                >
                  <div className="aspect-video "></div>
                  <div className="p-6">
                    <div className="h-6 rounded mb-2"></div>
                    <div className="h-4 rounded mb-4"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 rounded w-20"></div>
                      <div className="h-4 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("clientsPage.projects.noProjects")}
                </h3>
                <p className="text-text-secondary mb-6">
                  {t("clientsPage.projects.noProjectsDesc")}
                </p>
                <Link href="/projects/create" className="btn btn-primary">
                  {t("clientsPage.projects.postFirstProject")}
                </Link>
              </div>
            ) : (
              projects.map((project) => {
                const creatorId = project.userId || project.clientId;
                const creator = profiles[creatorId];
                return (
                  <div
                    key={project.id}
                    className="bg-background rounded-xl shadow-lg border border-border overflow-hidden hover:shadow-xl hover:border-secondary/50 transition-all duration-300 group"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <ProjectImage
                        {...getProjectImageProps(project)}
                        size="full"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 z-10">
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      {/* Creator info */}
                      <div className="flex items-center gap-2 mt-4">
                        <Avatar
                          src={creator?.avatarUrl}
                          alt={creator?.fullName}
                          name={creator?.fullName || "Unknown"}
                          size="lg"
                        />
                        <div>
                          <span className="text-sm text-text-secondary font-medium">
                            {creator?.fullName || "Unknown"}
                          </span>
                          {creator?.userType && (
                            <div className="text-xs text-primary font-semibold">
                              {Array.isArray(creator.userType)
                                ? creator.userType.join(" / ")
                                : creator.userType}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("clientsPage.howItWorks.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t("clientsPage.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.howItWorks.steps.0.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.howItWorks.steps.0.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.howItWorks.steps.1.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.howItWorks.steps.1.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.howItWorks.steps.2.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.howItWorks.steps.2.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("clientsPage.benefits.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t("clientsPage.benefits.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-success/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.0.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.0.description")}
              </p>
            </div>

            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-info/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.1.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.1.description")}
              </p>
            </div>

            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-warning/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.2.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.2.description")}
              </p>
            </div>

            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-info/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.3.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.3.description")}
              </p>
            </div>

            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-secondary/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.4.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.4.description")}
              </p>
            </div>

            <div className="bg-background-secondary rounded-lg shadow-sm border border-border p-6 hover:border-success/50 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t("clientsPage.benefits.features.5.title")}
              </h3>
              <p className="text-text-secondary">
                {t("clientsPage.benefits.features.5.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("clientsPage.popularCategories.title")}
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              {t("clientsPage.popularCategories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {t("clientsPage.popularCategories.categories.0.title")}
              </h3>
              <p className="text-text-secondary text-sm">
                {t("clientsPage.popularCategories.categories.0.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {t("clientsPage.popularCategories.categories.1.title")}
              </h3>
              <p className="text-text-secondary text-sm">
                {t("clientsPage.popularCategories.categories.1.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {t("clientsPage.popularCategories.categories.2.title")}
              </h3>
              <p className="text-text-secondary text-sm">
                {t("clientsPage.popularCategories.categories.2.description")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">
                {t("clientsPage.popularCategories.categories.3.title")}
              </h3>
              <p className="text-text-secondary text-sm">
                {t("clientsPage.popularCategories.categories.3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-secondary via-secondary to-secondary-hover relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-40"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t("clientsPage.cta.title")}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t("clientsPage.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?type=client"
              className="btn bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {t("clientsPage.cta.postFirstProject")}
            </Link>
            <Link
              href="/projects"
              className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {t("clientsPage.cta.browseFreelancers")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
