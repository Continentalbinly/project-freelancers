"use client";

export default function CreditDeductionModal({
  open,
  diff,
  oldPostingFee,
  newPostingFee,
  onConfirm,
  onCancel,
  t,
}: any) {
  if (!open) return null;

  const isDeduct = diff > 0;
  const amount = Math.abs(diff);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold   mb-4">
          {t("editProject.reviewPostingFeeChange")}
        </h2>

        <p className="text-sm text-text-secondary mb-3">
          {t("editProject.oldFee")}:{" "}
          <span className="font-semibold">{oldPostingFee}</span>
        </p>

        <p className="text-sm text-text-secondary mb-3">
          {t("editProject.newFee")}:{" "}
          <span className="font-semibold">{newPostingFee}</span>
        </p>

        <p className="text-sm mb-4">
          {isDeduct ? (
            <>
              {t("editProject.youWillBeCharged")}{" "}
              <span className="text-red-500 font-semibold">{amount}</span>{" "}
              {t("editProject.credits")}.
            </>
          ) : (
            <>
              {t("editProject.youWillBeRefunded")}{" "}
              <span className="text-green-600 font-semibold">{amount}</span>{" "}
              {t("editProject.credits")}.
            </>
          )}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg cursor-pointer"
          >
            {t("editProject.cancel")}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer"
          >
            {t("editProject.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
