"use client";
import { Star } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function RatingForm({
  form,
  setForm,
  onSubmit,
  submitting,
  title,
}: any) {
  const { t } = useTranslationContext();

  const fields = [
    { key: "communication", label: t("rating.communication") },
    { key: "quality", label: t("rating.quality") },
    { key: "timeliness", label: t("rating.timeliness") },
    { key: "value", label: t("rating.value") },
  ];

  const renderStars = (field: string) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          onClick={() => setForm((prev: any) => ({ ...prev, [field]: n }))}
          className={`w-6 h-6 cursor-pointer transition ${
            n <= form[field]
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
        {title}
      </h3>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{f.label}</span>
            {renderStars(f.key)}
          </div>
        ))}
      </div>

      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 mt-4 text-sm"
        placeholder={t("rating.writeReview")}
        value={form.review}
        onChange={(e) =>
          setForm((prev: any) => ({ ...prev, review: e.target.value }))
        }
      />

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold cursor-pointer"
      >
        {submitting ? t("common.submiting") : t("common.submit")}
      </button>
    </div>
  );
}
