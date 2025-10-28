"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/service/firebase";
import {
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  doc,
} from "firebase/firestore";
import { timeAgo } from "@/service/timeUtils";
import { formatLAK } from "@/service/currencyUtils";
import ProjectImage from "@/app/utils/projectImageHandler";
import FavoriteButton from "@/app/components/FavoriteButton";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";

export default function RecentProjects({ user }: any) {
  const { t } = useTranslationContext();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRecentProjects();
  }, [user]);

  async function fetchRecentProjects() {
    try {
      setLoading(true);

      const ref = collection(db, "projects");
      const q = query(
        ref,
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const snap = await getDocs(q);

      const list = await Promise.all(
        snap.docs.map(async (projectDoc) => {
          const data = projectDoc.data();
          const projectId = projectDoc.id;

          // 🔹 Fetch project owner's profile
          let clientProfile = null;
          if (data.clientId) {
            const profileRef = doc(db, "profiles", data.clientId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) clientProfile = profileSnap.data();
          }

          return {
            id: projectId,
            ...data,
            clientProfile,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        })
      );

      setProjects(list);
    } catch (err) {
      console.error("❌ Error fetching recent projects:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatBudget = (budget: number, type: string) =>
    type === "hourly"
      ? `${formatLAK(budget, { compact: true })}/hr`
      : formatLAK(budget, { compact: true });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700 border border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return t("projects.statuses.open") || "Open";
      case "in_progress":
        return t("projects.statuses.inProgress") || "In Progress";
      case "completed":
        return t("projects.statuses.completed") || "Completed";
      case "cancelled":
        return t("projects.statuses.cancelled") || "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  if (loading)
    return (
      <div className="bg-white rounded-lg border border-border p-6 text-center">
        <p className="text-text-secondary italic">{t("common.loading")}</p>
      </div>
    );

  if (!projects.length)
    return (
      <div className="bg-white rounded-lg border border-border p-6 text-center">
        <p className="text-text-secondary">
          {t("userHomePage.recentProjects.noProjects")}
        </p>
        <Link href="/projects" className="btn btn-primary mt-3">
          {t("userHomePage.recentProjects.viewAll")}
        </Link>
      </div>
    );

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">
          {t("userHomePage.recentProjects.title")}
        </h2>
        <Link
          href="/projects"
          className="text-primary hover:text-primary-hover font-medium"
        >
          {t("userHomePage.recentProjects.viewAll")}
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col"
          >
            {/* 🖼️ Project Image */}
            <div
              onClick={() => (window.location.href = `/projects/${project.id}`)}
              className="relative h-36 sm:h-40 cursor-pointer overflow-hidden"
            >
              <ProjectImage
                src={project.imageUrl || "/images/default-project.jpg"}
                alt={project.title}
                size="full"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton projectId={project.id} size="sm" />
              </div>
            </div>

            {/* 📋 Project Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-text-primary line-clamp-2">
                    {project.title}
                  </h3>
                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                  {project.description}
                </p>

                {project.category && (
                  <p className="text-xs text-text-secondary mb-2">
                    {t("projects.projectCard.category")}{" "}
                    <span className="font-medium text-text-primary">
                      {project.category.name_en || project.category.name_lo}
                    </span>
                  </p>
                )}
              </div>

              {/* 💰 Budget + 🕒 Posted Time */}
              <div className="space-y-1 text-xs sm:text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    {t("projects.projectCard.budget")}:
                  </span>
                  <span className="font-medium text-text-primary">
                    {formatBudget(project.budget, project.budgetType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    {t("projects.projectCard.posted")}:
                  </span>
                  <span className="text-text-primary">
                    {timeAgo(project.createdAt)}
                  </span>
                </div>
              </div>

              {/* 👤 Owner (client) */}
              {project.clientProfile && (
                <div className="mt-auto flex items-center gap-2 pt-2 border-t border-border/60">
                  <Avatar
                    {...getAvatarProps(project.clientProfile, {
                      uid: project.clientId,
                    })}
                    size="sm"
                  />
                  <p className="text-xs text-text-secondary truncate">
                    {t("projects.projectCard.postedBy")}{" "}
                    <span className="text-text-primary font-medium">
                      {project.clientProfile.fullName || "Unknown"}
                    </span>
                  </p>
                </div>
              )}

              {/* 🔗 Action */}
              <Link
                href={`/projects/${project.id}`}
                className="btn btn-primary w-full mt-3 text-xs sm:text-sm"
              >
                {t("projects.projectCard.viewDetails")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
