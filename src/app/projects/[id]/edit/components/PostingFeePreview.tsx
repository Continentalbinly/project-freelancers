"use client";

export default function PostingFeePreview({ oldFee, preview, t }: any) {
  const { newPostingFee, diff } = preview;

  if (diff === 0) return null;

  return (
    <div className="p-4 bg-gray-50 border border-border rounded-lg shadow-sm space-y-1">
      <p className="text-sm text-text-secondary">
        {t("editProject.feeChanged")}
      </p>

      <p className="text-sm">
        {t("editProject.oldFee")}:{" "}
        <span className="font-semibold">{oldFee}</span>
      </p>

      <p className="text-sm">
        {t("editProject.newFee")}:{" "}
        <span className="font-semibold">{newPostingFee}</span>
      </p>

      {diff > 0 ? (
        <p className="text-sm text-red-600">
          +{diff} {t("editProject.creditsWillBeDeducted")}
        </p>
      ) : (
        <p className="text-sm text-green-600">
          {Math.abs(diff)} {t("editProject.creditsWillBeRefunded")}
        </p>
      )}
    </div>
  );
}
