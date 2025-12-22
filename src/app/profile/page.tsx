"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/types/profile";
import PublicProfileView from "./components/PublicProfileView";
import ComprehensiveProfileEditor from "./components/ComprehensiveProfileEditor";
import { PublicProfileSkeleton } from "./components/ProfileSkeleton";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [showComprehensiveEditor, setShowComprehensiveEditor] = useState(false);
  const [localProfile, setLocalProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile && user) {
      // Ensure profile has id field (use user.uid as fallback)
      setLocalProfile({
        ...profile,
        id: profile.id || user.uid,
      } as Profile);
    } else {
      setLocalProfile(null);
    }
  }, [profile, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (!user || !localProfile) return null;

  return (
    <>
      <PublicProfileView 
        profile={localProfile} 
        isOwner={true}
        onEditProfile={() => setShowComprehensiveEditor(true)}
        onProfileUpdate={refreshProfile}
      />

      {/* Comprehensive Profile Editor Modal */}
      {showComprehensiveEditor && (
        <ComprehensiveProfileEditor
          profile={localProfile}
          userId={user.uid}
          onSave={() => {
            setShowComprehensiveEditor(false);
            refreshProfile();
          }}
          onCancel={() => setShowComprehensiveEditor(false)}
        />
      )}
    </>
  );
}
