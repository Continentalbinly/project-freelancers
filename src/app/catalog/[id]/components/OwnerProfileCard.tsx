"use client";

import { useRouter } from "next/navigation";
import { Star, User } from "lucide-react";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";

interface OwnerProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  rating: number;
  totalRatings: number;
  projectsCompleted: number;
}

interface OwnerProfileCardProps {
  owner: OwnerProfile;
  currentUserId?: string;
  t: (key: string) => string;
}

export default function OwnerProfileCard({ owner, currentUserId, t }: OwnerProfileCardProps) {
  const router = useRouter();

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/profile/${owner.id}`);
  };

  return (
    <div className="bg-linear-to-br from-primary/5 dark:from-primary-dark/10 to-secondary/5 dark:to-secondary-dark/10 border-2 border-primary/20 dark:border-primary-dark/30 rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="text-center mb-4 border-b border-primary/20 dark:border-primary-dark/30">
        <p className="text-md font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide mb-4">
          {t("catalogDetail.freelancerProfile")}
        </p>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 shadow-lg rounded-full border-4 border-primary dark:border-primary-dark overflow-hidden">
          <Avatar {...getAvatarProps(owner)} size="2xl" />
        </div>
        <h3 className="font-bold text-text-primary dark:text-text-primary-dark text-2xl text-center">
          {owner.fullName}
        </h3>
      </div>

      {/* Rating */}
      <div className="text-center mb-6 pb-6 border-b border-primary/20 dark:border-primary-dark/30">
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.round(owner.rating)
                  ? "fill-warning text-warning"
                  : "text-border/30 dark:text-border-dark/30"
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          {owner.rating.toFixed(1)}/5.0
        </p>
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
          ({owner.totalRatings} {t("catalogDetail.ratings") || "ratings"})
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-background dark:bg-background-dark rounded-xl p-4 border border-success/20 dark:border-success/30 text-center hover:border-success/40 dark:hover:border-success/50 transition-all">
          <p className="text-3xl font-bold text-success">
            {owner.projectsCompleted}
          </p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 font-medium">
            {t("catalogDetail.projectsDone")}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <p className="text-xs text-text-secondary dark:text-text-secondary-dark text-center mt-4">
        {t("catalogDetail.verifiedFreelancer")}
      </p>

      {/* View Profile Button - Only show if current user is not the owner */}
      {currentUserId && currentUserId !== owner.id && (
        <div className="mt-6 pt-6 border-t border-primary/20 dark:border-primary-dark/30">
          <button
            onClick={handleViewProfile}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm cursor-pointer"
          >
            <User className="w-4 h-4" />
            {t("orderDetail.viewProfile") || "View Profile"}
          </button>
        </div>
      )}
    </div>
  );
}
