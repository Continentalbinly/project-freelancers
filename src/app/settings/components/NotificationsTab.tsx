"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { Profile } from "@/types/profile"; // adjust path to your profile.ts type

export default function NotificationsTab() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslationContext();

  // Restrict field type to keys of Profile that are booleans
  type BooleanField = keyof Pick<
    Profile,
    | "emailNotifications"
    | "projectUpdates"
    | "marketingEmails"
    | "proposalNotifications"
    | "browserNotifications"
    | "weeklyDigest"
  >;

  async function toggle(field: BooleanField, value: boolean) {
    if (!user) return;
    const ref = doc(db, "profiles", user.uid);
    await updateDoc(ref, { [field]: !value });
    await refreshProfile();
  }

  const items: { field: BooleanField; title: string; desc: string }[] = [
    {
      field: "emailNotifications",
      title: t("settings.notificationPreferences.emailNotifications.title"),
      desc: t(
        "settings.notificationPreferences.emailNotifications.description"
      ),
    },
    {
      field: "projectUpdates",
      title: t("settings.notificationPreferences.projectUpdates.title"),
      desc: t("settings.notificationPreferences.projectUpdates.description"),
    },
    {
      field: "marketingEmails",
      title: t("settings.notificationPreferences.marketingEmails.title"),
      desc: t("settings.notificationPreferences.marketingEmails.description"),
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.field}
          className="flex items-center justify-between p-4 rounded-lg"
        >
          <div>
            <h4 className="font-medium">{item.title}</h4>
            <p className="text-sm text-text-secondary">{item.desc}</p>
          </div>

          <button suppressHydrationWarning
            onClick={() =>
              toggle(
                item.field,
                (profile?.[item.field as keyof Profile] as boolean) ?? true
              )
            }
            className={`w-12 h-6 rounded-full relative ${
              profile?.[item.field as keyof Profile]
                ? "bg-primary"
                : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                profile?.[item.field as keyof Profile] ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
