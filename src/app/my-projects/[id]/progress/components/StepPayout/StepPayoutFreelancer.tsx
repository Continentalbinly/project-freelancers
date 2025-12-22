"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Project } from "@/types/project";

interface StepPayoutFreelancerProps {
  project: Project;
}

export default function StepPayoutFreelancer({ project }: StepPayoutFreelancerProps) {
  const { t } = useTranslationContext();
  const [completed, setCompleted] = useState(false);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const amount = project.payoutAmount ?? project.budget ?? 0;

  // Poll project.status
  useEffect(() => {
    const checkStatus = async () => {
      const firestore = requireDb();
      const snap = await getDoc(doc(firestore, "projects", project.id));
      if (snap.exists() && snap.data().status === "completed") {
        setCompleted(true);
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    };

    const interval = setInterval(checkStatus, 2500);
    pollInterval.current = interval;

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [project.id]);

  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-sm p-6 text-center border border-gray-100 animate-fadeIn">
      {!completed ? (
        <>
          <h2 className="text-2xl font-bold mb-2">
            {t("payout.freelancer.waitingTitle")}
          </h2>

          <p className="text-gray-600 mb-4">
            {t("payout.freelancer.waitingDesc")}
          </p>

          <p className="text-lg font-semibold text-gray-800 mb-6">
            {t("payout.freelancer.amount")}:
            <span className="text-primary ml-1">
              {amount.toLocaleString()} LAK
            </span>
          </p>

          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>

            <p className="text-xs text-gray-400 animate-pulse">
              {t("payout.freelancer.autoUpdating")}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center mb-4 animate-fadeIn">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-green-600 mb-2">
            {t("payout.freelancer.doneTitle")}
          </h2>

          <p className="text-gray-600">{t("payout.freelancer.doneDesc")}</p>

          <p className="text-lg font-semibold text-gray-800 mt-4">
            {t("payout.freelancer.receivedAmount")}:
            <span className="text-green-600 ml-1">
              {amount.toLocaleString()} LAK
            </span>
          </p>
        </>
      )}
    </div>
  );
}
