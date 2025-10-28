"use client";

import { formatLAK } from "@/service/currencyUtils";

interface CreditWarningModalProps {
  show: boolean;
  onClose: () => void;
  t: (key: string) => string;
  userCredits?: number; // optional, display available credit
  projectBudget?: number; // optional, display required amount
}

export default function CreditWarningModal({
  show,
  onClose,
  t,
  userCredits = 0,
  projectBudget = 0,
}: CreditWarningModalProps) {
  if (!show) return null;

  // 🧮 Remaining after deduction
  const remaining = userCredits - projectBudget;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center border border-border">
        {/* 🧾 Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t("createProject.insufficientCredits") || "Not Enough Credits"}
        </h3>

        {/* 💬 Description */}
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          {t("createProject.insufficientCreditsMessage") ||
            "You don't have enough credits to create this project. Please buy more credits to continue."}
        </p>

        {/* 💰 Credit summary */}
        <div className="bg-gray-50 border border-border rounded-lg p-4 text-sm text-left space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-text-primary font-medium">
              {t("createProject.yourCredits") || "Your Credits"}:
            </span>
            <span className="text-primary font-semibold">
              {formatLAK(userCredits)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-primary font-medium">
              {t("createProject.requiredCredits") || "Required"}:
            </span>
            <span className="text-text-primary font-semibold">
              {formatLAK(projectBudget)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-primary font-medium">
              {t("createProject.remaining") || "Remaining"}:
            </span>
            <span
              className={`font-semibold ${
                remaining < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {formatLAK(remaining)}
            </span>
          </div>
        </div>

        {/* 🔘 Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline px-4 py-2 text-sm"
          >
            {t("createProject.cancel") || "Cancel"}
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.href = "/topup";
            }}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            {t("createProject.buyCredits") || "Top Up Credits"}
          </button>
        </div>
      </div>
    </div>
  );
}
