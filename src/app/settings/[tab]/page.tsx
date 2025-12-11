"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import NotificationsTab from "../components/NotificationsTab";
import PrivacyTab from "../components/PrivacyTab";
import AccountTab from "../components/AccountTab";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SettingsDetailPage() {
  const router = useRouter();
  const { tab } = useParams(); // 👈 This gets 'privacy', 'account', etc.
  const { t } = useTranslationContext();

  const titleMap: Record<string, string> = {
    notifications: t("settings.notifications") || "Notifications",
    privacy: t("settings.privacy") || "Privacy",
    account: t("settings.account") || "Account",
  };

  return (
    <div className="bg-background-secondary min-h-screen">
      {/* 🧭 Header */}
      <div className="sticky top-16 bg-background shadow-sm border-b border-border px-4 py-3 flex items-center gap-2 z-20">
        <button
          onClick={() => router.push("/settings")}
          className="p-2 rounded-md hover:bg-background-secondary transition"
        >
          <ChevronLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {titleMap[tab as string] || "Settings"}
        </h2>
      </div>

      {/* 🧩 Content */}
      <div className="p-4">
        {tab === "notifications" && <NotificationsTab />}
        {tab === "privacy" && <PrivacyTab />}
        {tab === "account" && <AccountTab />}
      </div>
    </div>
  );
}
