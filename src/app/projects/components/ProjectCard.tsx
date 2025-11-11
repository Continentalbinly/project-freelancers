"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import ProjectImage from "@/app/utils/projectImageHandler";
import FavoriteButton from "@/app/components/FavoriteButton";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { formatLAK } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { timeAgo } from "@/service/timeUtils";

export default function ProjectCard({
  project,
  t,
  incrementProjectViews,
}: any) {
  const { currentLanguage } = useTranslationContext();
  const [owner, setOwner] = useState<any>(null);

  /* 🔹 Fetch project owner profile */
  useEffect(() => {
    async function fetchOwner() {
      if (!project.clientId) return;
      try {
        const ref = doc(db, "profiles", project.clientId);
        const snap = await getDoc(ref);
        if (snap.exists()) setOwner({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("❌ Failed to fetch owner profile:", err);
      }
    }
    fetchOwner();
  }, [project.clientId]);

  const formatBudget = (budget: number, type: string) =>
    type === "hourly"
      ? `${formatLAK(budget, { compact: true })}/hr`
      : formatLAK(budget, { compact: true });

  const categoryName =
    typeof project.category === "object"
      ? currentLanguage === "lo"
        ? project.category.name_lo || project.category.name_en
        : project.category.name_en || project.category.name_lo
      : project.category;

  /* 🎨 Status helpers */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700 border border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "in_review":
        return "bg-amber-100 text-amber-700 border border-amber-200";
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
        return t("common.status.statusOpen") || "Open";
      case "in_progress":
        return t("common.status.statusInProgress") || "In Progress";
      case "in_review":
        return t("common.status.statusInReview") || "In Review";
      case "completed":
        return t("common.status.statusCompleted") || "Completed";
      case "cancelled":
        return t("common.status.statusCancelled") || "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  /* 🖱️ Handle click anywhere on card */
  const handleCardClick = async () => {
    try {
      await incrementProjectViews(project.id);
      window.location.href = `/projects/${project.id}`;
    } catch (err) {
      console.error("❌ Failed to increment views:", err);
      window.location.href = `/projects/${project.id}`;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm border border-border overflow-hidden flex flex-col hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer relative group"
    >
      {/* 🖼️ Image */}
      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
        <ProjectImage
          src={project.imageUrl || "/images/default-project.jpg"}
          alt={project.title || "Project image"}
          size="full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* ❤️ Favorite (stops click bubbling) */}
        <div
          className="absolute top-2 right-2"
          onClick={(e) => e.stopPropagation()}
        >
          <FavoriteButton projectId={project.id} size="sm" />
        </div>
      </div>

      {/* 📄 Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* 🏷️ Title & Status */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-base sm:text-lg text-text-primary leading-snug line-clamp-2">
              {project.title}
            </h3>
            {project.status && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                  project.status
                )}`}
              >
                {getStatusLabel(project.status)}
              </span>
            )}
          </div>

          {/* 📜 Description */}
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* 👤 Owner */}
          {owner && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar {...getAvatarProps(owner)} size="sm" />
              <div className="text-xs text-text-secondary truncate">
                <span className="font-medium text-text-primary">
                  {owner.fullName}
                </span>
                <span>
                  {owner.rating
                    ? ` • ⭐ ${owner.rating.toFixed(1)}`
                    : ` • ${t("common.noRating")}`}
                </span>
                <span className="text-xs text-text-secondary">
                  {owner.totalRatings ? ` • (${owner.totalRatings})` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 📊 Info */}
        <div className="text-xs sm:text-sm mt-1 space-y-0.5">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {t("projects.projectCard.category")}
            </span>
            <span className="font-medium text-text-primary truncate max-w-[60%] text-right">
              {categoryName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {t("projects.projectCard.budget")}:
            </span>
            <span className="font-medium text-text-primary">
              {formatBudget(project.budget, project.budgetType)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {t("common.createdAt")}:
            </span>
            <span className="font-medium text-text-primary">
              {timeAgo(project.createdAt, currentLanguage)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">
              {t("projects.projectCard.views")}:
            </span>
            <span className="font-medium text-text-primary">
              {project.views || 0}
            </span>
          </div>
        </div>

        {/* 🔗 View Details Button (stops click bubbling) */}
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/projects/${project.id}`}
            onClick={async (e) => {
              e.preventDefault();
              await incrementProjectViews(project.id);
              window.location.href = `/projects/${project.id}`;
            }}
            className="mt-3 inline-block text-center text-xs sm:text-sm font-medium px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all w-full"
          >
            {t("projects.projectCard.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
