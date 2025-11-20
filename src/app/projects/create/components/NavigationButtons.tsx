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
  projectBudget: number; // 👈 passed directly from parent
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
  projectBudget,
}: NavProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  // Fetch user's credit from profile
  useEffect(() => {
    async function fetchCredits() {
      if (!user) return;
      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setCredits(snap.data().credit ?? 0);
      } catch (err) {
        //console.error("❌ Error fetching credit:", err);
      }
    }
    fetchCredits();
  }, [user]);

  // 🪙 Handle submit check
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credits < Number(projectBudget)) {
      setShowModal(true);
      return;
    }
    handleSubmit(e);
  };

  return (
    <div className="flex justify-between pt-6 border-t border-border mt-6 relative">
      <button
        type="button"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="btn btn-outline flex items-center gap-2 disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        {t("createProject.previous")}
      </button>

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
            ? t("createProject.creating") || "Creating..."
            : t("createProject.createProject") || "Create Project"}
        </button>
      )}

      {/* ⚠️ Credit Warning Modal */}
      <CreditWarningModal
        show={showModal}
        onClose={() => setShowModal(false)}
        t={t}
        userCredits={credits}
        projectBudget={projectBudget}
      />
    </div>
  );
}
