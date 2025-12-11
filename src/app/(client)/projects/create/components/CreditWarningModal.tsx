"use client";

interface CreditWarningModalProps {
  show: boolean;
  onClose: () => void;
  t: (key: string) => string;
  userCredits?: number;
  postingFee?: number;
}

export default function CreditWarningModal({
  show,
  onClose,
  t,
  userCredits = 0,
  postingFee = 0,
}: CreditWarningModalProps) {
  if (!show) return null;

  const remaining = userCredits - postingFee;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fade-in">
      <div className="p-6 rounded-2xl shadow-lg max-w-sm w-full text-center border border-border">
        {/* Title */}
        <h3 className="text-lg font-semibold   mb-2">
          {t("createProject.insufficientCredits")}
        </h3>

        {/* Message */}
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          {t("createProject.insufficientCreditsMessagePosting")}
        </p>

        {/* Summary */}
        <div className="border border-border rounded-lg p-4 text-sm text-left space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="  font-medium">
              {t("createProject.yourCredits")}
            </span>
            <span className="text-primary font-semibold">{userCredits}</span>
          </div>

          <div className="flex justify-between">
            <span className="  font-medium">
              {t("createProject.postingFee")}
            </span>
            <span className="  font-semibold">
              {postingFee}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="  font-medium">
              {t("createProject.remaining")}
            </span>
            <span
              className={`font-semibold ${
                remaining < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline px-4 py-2 text-sm"
          >
            {t("common.cancel")}
          </button>

          <button
            onClick={() => {
              onClose();
              window.location.href = "/topup";
            }}
            className="btn btn-primary px-4 py-2 text-sm"
          >
            {t("createProject.buyCredits")}
          </button>
        </div>
      </div>
    </div>
  );
}
