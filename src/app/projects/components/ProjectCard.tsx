"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import ProjectImage from "@/app/utils/projectImageHandler";
import FavoriteButton from "@/app/components/FavoriteButton";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { formatLAK } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { timeAgo } from "@/service/timeUtils";
import {
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  TagIcon,
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon as InProgressIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import type { Project } from "@/types/project";
import type { Profile } from "@/types/profile";

interface ProjectCardProps {
  project: Project;
  t: (key: string) => string;
  incrementProjectViews: (projectId: string) => Promise<void>;
}

export default function ProjectCard({
  project,
  t,
  incrementProjectViews,
}: ProjectCardProps) {
  const { currentLanguage } = useTranslationContext();
  const router = useRouter();
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(true);

  /* 🔹 Fetch project owner profile */
  useEffect(() => {
    async function fetchOwner() {
      if (!project.clientId) {
        setLoadingOwner(false);
        return;
      }
      try {
        setLoadingOwner(true);
        const firestore = requireDb();
        const ref = doc(firestore, "profiles", project.clientId);
        const snap = await getDoc(ref);
        if (snap.exists()) setOwner({ id: snap.id, ...snap.data() } as Profile);
      } catch {
        //console.error("❌ Failed to fetch owner profile");
      } finally {
        setLoadingOwner(false);
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
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return {
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: CheckCircleIcon,
          text: t("common.status.statusOpen") || "Open",
        };
      case "in_progress":
        return {
          color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          icon: InProgressIcon,
          text: t("common.status.statusInProgress") || "In Progress",
        };
      case "in_review":
        return {
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: ExclamationTriangleIcon,
          text: t("common.status.statusInReview") || "In Review",
        };
      case "completed":
        return {
          color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
          icon: CheckCircleIcon,
          text: t("common.status.statusCompleted") || "Completed",
        };
      case "cancelled":
        return {
          color: "bg-red-500/10 text-red-600 border-red-500/20",
          icon: XCircleIcon,
          text: t("common.status.statusCancelled") || "Cancelled",
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          icon: ClockIcon,
          text: status || "Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(project.status || "open");
  const StatusIcon = statusConfig.icon;

  /* 🖱️ Handle click anywhere on card */
  const handleCardClick = async (e?: React.MouseEvent) => {
    const target = e?.target as HTMLElement;
    if (
      target?.closest("button") ||
      target?.closest("a") ||
      target?.tagName === "BUTTON"
    )
      return;

    try {
      await incrementProjectViews(project.id);
      router.push(`/projects/${project.id}`);
    } catch {
      //console.error("❌ Failed to increment views");
      router.push(`/projects/${project.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-background rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* 🖼️ Image with Gradient Overlay */}
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-linear-to-br from-primary/5 via-secondary/5 to-primary/5">
        <ProjectImage
          src={project.imageUrl || "/default-project.png"}
          alt={project.title || "Project image"}
          size="full"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          {/* Status Badge */}
          {project.status && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${statusConfig.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.text}</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton projectId={project.id} size="sm" />
          </div>
        </div>

        {/* Budget Badge at bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span className="font-bold text-sm sm:text-base">
              {formatBudget(project.budget, project.budgetType)}
            </span>
          </div>
        </div>
      </div>

      {/* 📄 Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Title & Category */}
        <div className="mb-3">
          <h3 className="font-bold text-lg sm:text-xl text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {project.description}
          </p>
        </div>

        {/* Details Section with Gradient */}
        <div className="relative mb-4 rounded-xl overflow-hidden bg-linear-to-b from-primary/5 via-secondary/5 to-primary/5 p-4">
          {/* Owner Info */}
          {loadingOwner ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
              <div className="flex-1 h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse" />
            </div>
          ) : owner ? (
            <div className="flex items-center gap-3 mb-4">
              <Avatar {...getAvatarProps(owner)} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-text-primary truncate">
                    {owner.fullName}
                  </span>
                  {owner.rating && (
                    <span className="flex items-center gap-0.5 text-amber-600 text-xs whitespace-nowrap">
                      <StarIcon className="w-3.5 h-3.5 fill-current" />
                      <span className="font-medium">{owner.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>
                {owner.totalRatings && (
                  <p className="text-xs text-text-secondary">
                    {owner.totalRatings} {t("common.ratings") || "ratings"}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TagIcon className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("projects.projectCard.category")}
                </h4>
              </div>
              <p className="text-sm text-text-primary font-medium line-clamp-1">
                {categoryName}
              </p>
            </div>

            {/* Posted Date */}
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ClockIcon className="w-4 h-4 text-secondary" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("common.createdAt")}
                </h4>
              </div>
              <p className="text-sm text-text-primary font-medium line-clamp-1">
                {timeAgo(project.createdAt, currentLanguage)}
              </p>
            </div>

            {/* Views */}
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <EyeIcon className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("projects.projectCard.views")}
                </h4>
              </div>
              <p className="text-sm text-text-primary font-medium">
                {project.views || 0}
              </p>
            </div>

            {/* Proposals Count */}
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("projects.projectCard.proposals")}
                </h4>
              </div>
              <p className="text-sm text-text-primary font-medium">
                {project.proposalsCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await incrementProjectViews(project.id);
            router.push(`/projects/${project.id}`);
          }}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-sm hover:shadow-md group/btn"
        >
          <span>{t("projects.projectCard.viewDetails")}</span>
          <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
