"use client";

import Link from "next/link";
import { Bell, Lock, UserCog2 } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function SettingsOverviewPage() {
  const { t } = useTranslationContext();

  const cards = [
    {
      key: "notifications",
      title: t("settings.notifications") || "Notifications",
      desc:
        t("settings.notificationsDesc") ||
        "Manage email and push notifications.",
      icon: Bell,
    },
    {
      key: "privacy",
      title: t("settings.privacy") || "Privacy",
      desc:
        t("settings.privacyDesc") || "Control visibility and data permissions.",
      icon: Lock,
    },
    {
      key: "account",
      title: t("settings.account") || "Account",
      desc:
        t("settings.accountDesc") ||
        "Change password, name, or delete account.",
      icon: UserCog2,
    },
  ];

  return (
    <div className="py-8 px-4 bg-gray-50 min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t("settings.title") || "Settings"}
      </h1>

      <div className="space-y-4">
        {cards.map(({ key, title, desc, icon: Icon }) => (
          <Link
            key={key}
            href={`/settings/${key}`} // ✅ Now links to /settings/privacy, etc.
            className="bg-background rounded-xl border border-border shadow-sm p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-sm">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
