"use client";

export default function StepSuccess({ t, updateSession }: any) {
  const handleBack = () => {
    updateSession({
      step: "select",
      qrCode: null,
      transactionId: null,
      expiresAt: null,
      status: null,
    });
  };

  return (
    <div className="text-center py-10">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
          <span className="text-success text-4xl">✓</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-success mt-4">
        {t("topup.success")}
      </h1>
      <p className="mt-2 text-text-secondary">{t("topup.successMessage")}</p>

      <button
        onClick={handleBack}
        className="mt-6 px-6 py-3 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary/90 transition"
      >
        {t("topup.backToTopup")}
      </button>
    </div>
  );
}
