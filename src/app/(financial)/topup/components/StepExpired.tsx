"use client";

import { useEffect } from "react";

export default function StepExpired({ t, onRetry, session }: any) {
  const expireTransaction = async () => {
    if (!session?.transactionId) return;

    await fetch("/api/payment/expire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId: session.transactionId,
      }),
    });
  };

  useEffect(() => {
    expireTransaction();
  }, []);

  return (
    <div className="text-center py-10">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center">
          <span className="text-error text-4xl">!</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-error mt-4">
        {t("topup.expired")}
      </h1>
      <p className="mt-2 text-text-secondary">{t("topup.expiredMessage")}</p>

      <button
        className="mt-6 cursor-pointer px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        onClick={onRetry}
      >
        {t("topup.tryAgain")}
      </button>
    </div>
  );
}
