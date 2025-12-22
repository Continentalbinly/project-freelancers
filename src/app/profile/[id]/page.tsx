"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { requireDb } from "@/service/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Profile } from "@/types/profile";
import PublicProfileView from "../components/PublicProfileView";
import { PublicProfileSkeleton } from "../components/ProfileSkeleton";
import { toast } from "react-toastify";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileId = params.id as string;

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        router.push("/");
        return;
      }

      // If viewing own profile, redirect to /profile
      if (user && user.uid === profileId) {
        router.push("/profile");
        return;
      }

      try {
        setLoading(true);
        const db = requireDb();
        const profileDoc = await getDoc(doc(db, "profiles", profileId));
        
        if (!profileDoc.exists()) {
          toast.error(t("profile.notFound") || "Profile not found");
          router.push("/");
          return;
        }

        const data = profileDoc.data();
        
        // Check profile visibility
        if (data.profileVisibility === false && (!user || user.uid !== profileId)) {
          toast.error(t("profile.private") || "This profile is private");
          router.push("/");
          return;
        }

        setProfile({ id: profileDoc.id, ...data } as Profile);
      } catch {
        // Silent fail
        toast.error(t("common.error") || "Failed to load profile");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId, user, router, t]);

  if (loading) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) {
    return null;
  }

  return <PublicProfileView profile={profile} isOwner={user?.uid === profile.id} />;
}

