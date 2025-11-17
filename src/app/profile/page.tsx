"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

import useProfileData from "./hooks/useProfileData";
import ProfileHeader from "./components/ProfileHeader";
import OverviewTab from "./components/OverviewTab";
import PortfolioTab from "./components/PortfolioTab";
import SkillsTab from "./components/SkillsTab";
import EditModal from "./components/EditModal";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslationContext();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");

  /** ✅ Local profile copy for instant UI updates */
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  // ✅ Fetch user projects & proposals
  const { userProjects, loadingData } = useProfileData(user);

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // ✅ Read tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "overview" || tab === "portfolio" || tab === "skills") {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.push(url.pathname + url.search, { scroll: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "overview", label: t("profile.overview"), icon: "📊" },
    { id: "portfolio", label: t("profile.portfolio"), icon: "🎨" },
    { id: "skills", label: t("profile.skills"), icon: "⚡" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* === Profile Header === */}
        <ProfileHeader
          user={user}
          profile={localProfile} // ✅ use local copy
          setLocalProfile={setLocalProfile} // ✅ allow instant updates
          refreshProfile={refreshProfile}
          setIsEditing={setIsEditing}
          setEditField={setEditField}
          setEditValue={setEditValue}
          t={t}
        />

        {/* === Tabs === */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="border-b border-border flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* === Tab Content === */}
          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewTab
                t={t}
                userProjects={userProjects}
                profile={localProfile}
                user={user}
                loadingData={loadingData}
              />
            )}

            {activeTab === "portfolio" && (
              <PortfolioTab
                t={t}
                userProjects={userProjects}
                loadingData={loadingData}
              />
            )}

            {activeTab === "skills" && (
              <SkillsTab
                t={t}
                profile={localProfile}
                user={user}
                refreshProfile={refreshProfile}
              />
            )}
          </div>
        </div>

        {/* === Edit Modal === */}
        {isEditing && (
          <EditModal
            t={t}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editField={editField}
            setEditField={setEditField}
            editValue={editValue}
            setEditValue={setEditValue}
            profile={localProfile}
            setLocalProfile={setLocalProfile} // ✅ add this
            user={user}
            refreshProfile={refreshProfile}
          />
        )}
      </div>
    </div>
  );
}
