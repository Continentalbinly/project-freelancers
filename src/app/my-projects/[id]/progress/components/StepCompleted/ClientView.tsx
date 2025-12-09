"use client";
import { useState } from "react";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import RatingForm from "./RatingForm";
import { submitRating } from "./ratingLogic";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function ClientView({ project, hasRated, files }: any) {
  const { t } = useTranslationContext();

  const [form, setForm] = useState({
    communication: 5,
    quality: 5,
    timeliness: 5,
    value: 5,
    review: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const ok = await submitRating({
      form,
      project,
      isClient: true,
    });

    if (ok) window.location.reload();
    else setSubmitting(false);
  };

  return (
    <div className="py-12 px-4">
      <h2 className="text-center text-2xl font-bold text-green-700">
        {t("myProjects.stepper.finalDelivery.title")}
      </h2>

      {files.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 max-w-lg mx-auto">
          {files.map((file: any) => (
            <a
              key={file.id}
              href={file.fileUrl}
              download
              className="flex items-center gap-3 border border-gray-200 p-3 rounded-xl bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-medium">{file.fileName}</span>
            </a>
          ))}
        </div>
      )}

      {!hasRated ? (
        <div className={submitting ? "opacity-50 pointer-events-none" : ""}>
          <RatingForm
            title={t("myProjects.stepper.rateFreelancer")}
            form={form}
            setForm={setForm}
            submitting={submitting}
            onSubmit={handleSubmit}
          />

          {submitting && (
            <div className="flex justify-center mt-4">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
          )}
        </div>
      ) : (
        <p className="text-green-600 font-medium text-center mt-8">
          {t("rating.alreadySubmitted")}
        </p>
      )}

      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mt-6 opacity-80" />
    </div>
  );
}
