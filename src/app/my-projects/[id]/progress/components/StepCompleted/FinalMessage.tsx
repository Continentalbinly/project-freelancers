"use client";
import { CheckCircle } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function FinalMessage() {
  const { t } = useTranslationContext();

  return (
    <div className="py-16 text-center px-6">
      <CheckCircle className="w-16 h-16 mx-auto text-green-600" />

      <h2 className="text-2xl font-bold text-green-700 mt-4">
        {t("rating.completedTitle") || "All Ratings Completed"}
      </h2>

      <p className="text-gray-500 max-w-md mx-auto mt-3 leading-relaxed">
        {t("rating.completedDesc") ||
          "You and the other party have rated each other. This project is now fully completed."}
      </p>
    </div>
  );
}
