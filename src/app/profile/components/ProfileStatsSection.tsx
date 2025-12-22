"use client";

import { useEffect, useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Profile } from "@/types/profile";
import { Calendar, Briefcase, Award, TrendingUp, DollarSign } from "lucide-react";
import { convertTimestampToDate } from "@/service/timeUtils";
import { requireDb } from "@/service/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

interface ProfileStatsSectionProps {
  profile: Profile;
}

export default function ProfileStatsSection({ profile }: ProfileStatsSectionProps) {
  const { t } = useTranslationContext();
  const [projectsPostedCount, setProjectsPostedCount] = useState<number | null>(null);
  
  const formatDate = (date: Date | Timestamp | Record<string, unknown> | string | number | null | undefined) => {
    if (!date) return t("profile.personalInfo.notSet") || "Not set";
    try {
      const dateValue = typeof date === 'object' && 'toDate' in date
        ? (date as Timestamp).toDate()
        : date instanceof Date
        ? date
        : date;
      const d = convertTimestampToDate(dateValue);
      if (isNaN(d.getTime())) {
        return t("profile.personalInfo.notSet") || "Not set";
      }
      return d.toLocaleDateString();
    } catch {
      return t("profile.personalInfo.notSet") || "Not set";
    }
  };

  // Fetch real project count for clients
  useEffect(() => {
    if (profile.role === "client" && profile.id) {
      const fetchProjectsCount = async () => {
        try {
          const projectsQuery = query(
            collection(requireDb(), "projects"),
            where("clientId", "==", profile.id)
          );
          const snapshot = await getCountFromServer(projectsQuery);
          setProjectsPostedCount(snapshot.data().count);
        } catch {
          // Silent fail
          setProjectsPostedCount(profile.projectsPosted || 0);
        }
      };
      fetchProjectsCount();
    }
  }, [profile.role, profile.id, profile.projectsPosted]);

  // Freelancer Stats
  if (profile.role === "freelancer") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.projectsCompleted") || "Projects Completed"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">{profile.projectsCompleted || 0}</p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.totalEarned") || "Total Earned"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">
            {profile.totalEarned ? `₭${profile.totalEarned.toLocaleString()}` : "₭0"}
          </p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.rating") || "Rating"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">
            {profile.rating ? profile.rating.toFixed(1) : "—"}
          </p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.memberSince") || "Member Since"}</span>
          </div>
          <p className="text-sm sm:text-lg font-semibold text-text-primary">{formatDate(profile.createdAt)}</p>
        </div>
      </div>
    );
  }

  // Client Stats
  if (profile.role === "client") {
    const displayProjectsPosted = projectsPostedCount !== null ? projectsPostedCount : (profile.projectsPosted || 0);
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.projectsPosted") || "Projects Posted"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">{displayProjectsPosted}</p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.totalSpent") || "Total Spent"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">
            {profile.totalSpent ? `₭${profile.totalSpent.toLocaleString()}` : "₭0"}
          </p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.rating") || "Rating"}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">
            {profile.rating ? profile.rating.toFixed(1) : "—"}
          </p>
        </div>
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.memberSince") || "Member Since"}</span>
          </div>
          <p className="text-sm sm:text-lg font-semibold text-text-primary">{formatDate(profile.createdAt)}</p>
        </div>
      </div>
    );
  }

  // For other roles (admin, etc.) - show basic stats
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.rating") || "Rating"}</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-text-primary">
          {profile.rating ? profile.rating.toFixed(1) : "—"}
        </p>
      </div>
      <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
          <span className="text-xs sm:text-sm text-text-secondary">{t("profile.stats.memberSince") || "Member Since"}</span>
        </div>
        <p className="text-sm sm:text-lg font-semibold text-text-primary">{formatDate(profile.createdAt)}</p>
      </div>
    </div>
  );
}
