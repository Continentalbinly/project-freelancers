"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/types/profile";
import PortfolioManager from "./PortfolioManager";
import ProfileHeroSection from "./ProfileHeroSection";
import ProfileStatsSection from "./ProfileStatsSection";
import ProfileExperienceSection from "./ProfileExperienceSection";
import ProfileCatalogsSection from "./ProfileCatalogsSection";
import ProfileProjectsSection from "./ProfileProjectsSection";

interface PublicProfileViewProps {
  profile: Profile;
  isOwner: boolean;
  onEditProfile?: () => void;
  onProfileUpdate?: () => void | Promise<void>;
}

export default function PublicProfileView({
  profile,
  isOwner,
  onEditProfile,
  onProfileUpdate,
}: PublicProfileViewProps) {
  const { t } = useTranslationContext();
  const { user } = useAuth();

  // Get userId - use profile.id if available, otherwise fallback to user.uid for owner
  const userId = profile.id || (isOwner && user?.uid) || "";

  // Don't render if we don't have a valid userId
  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section with Skills */}
        <ProfileHeroSection
          profile={profile}
          isOwner={isOwner}
          showEditButton={isOwner}
          onEditProfile={onEditProfile}
        />

        {/* Stats Grid - Shows different stats for freelancers and clients */}
        <ProfileStatsSection profile={profile} />

        {/* Portfolio */}
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
          <PortfolioManager userId={userId} isOwner={isOwner} />
        </div>
        {/* Experience */}
        <ProfileExperienceSection
          profile={profile}
          isOwner={isOwner}
          userId={userId}
          onUpdate={onProfileUpdate}
        />
        {/* Catalogs - For Freelancers */}
        {profile.role === "freelancer" && (
          <ProfileCatalogsSection profileId={userId} />
        )}

        {/* Projects - For Clients */}
        {profile.role === "client" && (
          <ProfileProjectsSection profileId={userId} />
        )}
      </div>
    </div>
  );
}
