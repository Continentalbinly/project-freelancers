"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CreditWarningModal from "./CreditWarningModal";

interface NavProps {
  currentStep: number;
  stepsLength: number;
  isStepValid: boolean;
  loading: boolean;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;

  // NEW — only posting fee is required for project posting
  postingFee: number;
}

export default function NavigationButtons({
  currentStep,
  stepsLength,
  isStepValid,
  loading,
  nextStep,
  prevStep,
  handleSubmit,
  t,
  postingFee,
}: NavProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  // Load user credit balance
  useEffect(() => {
    async function fetchCredits() {
      if (!user) return;

      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCredits(snap.data().credit ?? 0);
        }
      } catch (err) {
        console.log("❌ Error fetching credits:", err);
      }
    }

    fetchCredits();
  }, [user]);

  // Final submit → check posting fee only
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (credits < postingFee) {
      setShowModal(true);
      return;
    }

    handleSubmit(e);
  };

  return (
    <div className="flex justify-between pt-6 border-t border-border mt-6 relative">
      {/* PREVIOUS BUTTON */}
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="btn btn-outline flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        {t("createProject.previous")}
      </button>

      {/* NEXT or SUBMIT */}
      {currentStep < stepsLength ? (
        <button
          type="button"
          onClick={nextStep}
          disabled={!isStepValid}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {t("createProject.next")}
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="submit"
          onClick={handleFinalSubmit}
          disabled={loading}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading
            ? t("createProject.creating")
            : t("createProject.createProject")}
        </button>
      )}

      {/* CREDIT WARNING MODAL */}
      <CreditWarningModal
        show={showModal}
        onClose={() => setShowModal(false)}
        t={t}
        userCredits={credits}
        postingFee={postingFee}
      />
    </div>
  );
}
