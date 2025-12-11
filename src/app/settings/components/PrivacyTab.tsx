"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { Profile } from "@/types/profile"; // ✅ adjust the import path

export default function PrivacyTab() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslationContext();

  // ✅ Only keep relevant privacy toggles
  type BooleanField = keyof Pick<
    Profile,
    "profileVisibility" | "searchableProfile" | "allowMessages"
  >;

  // 🔹 Safe toggle update
  async function toggle(field: BooleanField, value: boolean) {
    if (!user) return;
    const ref = doc(db, "profiles", user.uid);
    await updateDoc(ref, { [field]: !value });
    await refreshProfile();
  }

  const items: { field: BooleanField; title: string; desc: string }[] = [
    {
      field: "profileVisibility",
      title: t("settings.privacySecurity.profileVisibility.title"),
      desc: t("settings.privacySecurity.profileVisibility.description"),
    },
    {
      field: "searchableProfile",
      title: t("settings.privacySecurity.searchableProfile.title"),
      desc: t("settings.privacySecurity.searchableProfile.description"),
    },
    {
      field: "allowMessages",
      title: t("settings.privacySecurity.allowMessages.title"),
      desc: t("settings.privacySecurity.allowMessages.description"),
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const fieldValue =
          (profile?.[item.field as keyof Profile] as boolean) ?? false;

        return (
          <div
            key={item.field}
            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border shadow-sm"
          >
            <div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </div>

            <button
              suppressHydrationWarning
              onClick={() => toggle(item.field, fieldValue)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                fieldValue ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  fieldValue ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
