"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Profile } from "@/types/profile";
import { Briefcase, Plus } from "lucide-react";
import ExperienceManager from "./ExperienceManager";

interface ProfileExperienceSectionProps {
  profile: Profile;
  isOwner?: boolean;
  userId?: string;
  onUpdate?: () => void;
}

export default function ProfileExperienceSection({ profile, isOwner = false, userId, onUpdate }: ProfileExperienceSectionProps) {
  const { t } = useTranslationContext();

  const hasExperience = profile.experience && profile.experience.length > 0;

  // If owner and userId provided, show ExperienceManager (with add/edit/delete)
  if (isOwner && userId) {
    return (
      <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
        <ExperienceManager userId={userId} profile={profile} onUpdate={onUpdate || (() => {})} />
      </div>
    );
  }

  // Public view (read-only)
  return (
    <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
      <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-4 sm:mb-6">
        {t("profile.experience.title") || "Experience"}
      </h2>
      
      {hasExperience ? (
        <div className="space-y-4">
          {profile.experience!.map((exp, idx) => (
            <div key={idx} className="border-l-2 border-primary pl-4">
              <h3 className="font-semibold text-text-primary text-sm sm:text-base">{exp.title}</h3>
              <p className="text-text-secondary text-sm">{exp.company}</p>
              <p className="text-xs sm:text-sm text-text-secondary">{exp.period}</p>
              {exp.description && (
                <p className="text-xs sm:text-sm text-text-secondary mt-2">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Briefcase className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" />
          <p className="text-text-secondary text-sm sm:text-base">
            {t("profile.experience.empty") || "No experience added yet"}
          </p>
        </div>
      )}
    </div>
  );
}
