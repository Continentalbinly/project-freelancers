"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import SettingsTabs from "./components/SettingsTabs";
import NotificationsTab from "./components/NotificationsTab";
import PrivacyTab from "./components/PrivacyTab";
import AccountTab from "./components/AccountTab";
import EditModal from "./components/EditModal";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const { t } = useTranslationContext();

  const [activeTab, setActiveTab] = useState("notifications");
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveTab(tab || "notifications");
  }, [searchParams]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t("settings.loading")}</p>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="bg-white rounded-xl shadow-sm border border-border">
          <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

          <div className="p-6">
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "privacy" && <PrivacyTab />}
            {activeTab === "account" && <AccountTab />}
          </div>
        </div>

        {isEditing && (
          <EditModal
            field={editField}
            value={editValue}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
    </div>
  );
}
