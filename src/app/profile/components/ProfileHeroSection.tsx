"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/types/profile";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { Star, MapPin, Globe } from "lucide-react";

interface ProfileHeroSectionProps {
  profile: Profile;
  isOwner?: boolean;
  showEditButton?: boolean;
  onEditProfile?: () => void;
}

export default function ProfileHeroSection({ profile, isOwner = false, showEditButton = false, onEditProfile }: ProfileHeroSectionProps) {
  const { t, currentLanguage } = useTranslationContext();
  const { user } = useAuth();

  return (
    <div className="bg-background-secondary dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-border dark:border-gray-700/50 shadow-sm dark:shadow-xl backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <Avatar
            {...getAvatarProps(profile, user)}
            size="xl"
            className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-lg"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{profile.fullName}</h1>
              {profile.occupation && (
                <p className="text-base sm:text-lg text-text-secondary">
                  {currentLanguage?.startsWith("lo") ? profile.occupation.name_lo : profile.occupation.name_en}
                </p>
              )}
            </div>
            {isOwner && showEditButton && (
              <button
                onClick={onEditProfile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {t("profile.editProfile") || "Edit Profile"}
              </button>
            )}
          </div>

          {profile.bio && (
            <p className="text-text-secondary mb-4 text-sm sm:text-base">{profile.bio}</p>
          )}

          {/* Info Row */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
            {profile.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                <span className="text-text-secondary">
                  ({t("profile.stats.ratingsFrom") || "ratings from"} {profile.totalRatings || 0})
                </span>
              </div>
            )}
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1 text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>{[profile.city, profile.country].filter(Boolean).join(", ") || t("profile.personalInfo.notSet")}</span>
              </div>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                <span>{t("profile.website") || "Website"}</span>
              </a>
            )}
          </div>

          {/* Skills - Merged into Hero */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="pt-4 border-t border-border dark:border-gray-700/50">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                {t("profile.skills") || "Skills"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-xs sm:text-sm font-medium border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

