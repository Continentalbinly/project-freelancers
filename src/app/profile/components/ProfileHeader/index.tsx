"use client";

import AvatarSection from "./AvatarSection";
import ProfileInfo from "./ProfileInfo";
import ProfileStats from "./ProfileStats";

export default function ProfileHeader({
  user,
  profile,
  t,
  setIsEditing,
  setEditField,
  setEditValue,
  refreshProfile,
  setLocalProfile,
}: any) {
  const handleEditName = () => {
    setIsEditing(true);
    setEditField("fullName");
    setEditValue(profile?.fullName || "");
  };

  return (
    <div className="rounded-sm shadow-sm border border-border dark:border-gray-800 p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar Upload */}
        <AvatarSection
          user={user}
          profile={profile}
          t={t}
          refreshProfile={refreshProfile}
          setLocalProfile={setLocalProfile}
        />

        <div className="flex-1">
          {/* Name + Email */}
          <ProfileInfo
            profile={profile}
            user={user}
            t={t}
            handleEditName={handleEditName}
          />

          {/* Stats */}
          <ProfileStats profile={profile} t={t} />
        </div>
      </div>
    </div>
  );
}
