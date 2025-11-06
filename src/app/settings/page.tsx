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
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t("settings.title") || "Settings"}
      </h1>

      <div className="space-y-4">
        {cards.map(({ key, title, desc, icon: Icon }) => (
          <Link
            key={key}
            href={`/settings/${key}`} // ✅ Now links to /settings/privacy, etc.
            className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
