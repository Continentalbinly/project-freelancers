"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { UserRole } from "./utils";

export default function StepOpen({}: {
  project: any;
  role: UserRole;
}) {
  useAuth();
  const { t } = useTranslationContext();

  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">
        {t("myProjects.stepper.step1.title")}
      </h2>
      <p className="text-gray-500 mb-6">{t("myProjects.stepper.step1.desc")}</p>
    </div>
  );
}
