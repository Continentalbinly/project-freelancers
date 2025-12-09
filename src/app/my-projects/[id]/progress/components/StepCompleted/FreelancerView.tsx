"use client";
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { submitRating } from "./ratingLogic";
import RatingForm from "./RatingForm";

export default function FreelancerView({ project, hasRated }: any) {
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
      isClient: false,
    });

    if (ok) window.location.reload();
    else setSubmitting(false);
  };

  return (
    <div className="py-12 px-4">
      <h2 className="text-center text-2xl font-bold text-green-700">
        {t("myProjects.stepper.step4.title")}
      </h2>

      <p className="text-gray-500 text-center max-w-md mx-auto mt-2">
        {t("myProjects.stepper.step4.descFreelancer")}
      </p>

      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mt-6 opacity-80" />

      {!hasRated ? (
        <div className={submitting ? "opacity-50 pointer-events-none" : ""}>
          <RatingForm
            title={t("myProjects.stepper.rateClient")}
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
    </div>
  );
}
