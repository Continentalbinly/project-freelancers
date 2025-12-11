"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const packages = [
  { price: 5000, credits: 10 },
  { price: 10000, credits: 25 },
  { price: 20000, credits: 60 },
  { price: 50000, credits: 100 },
];

export default function StepSelectAmount({
  session,
  updateSession,
  t,
  userId,
}: any) {
  const [loadingPkg, setLoadingPkg] = useState<number | null>(null);

  const choosePkg = async (pkg: any) => {
    setLoadingPkg(pkg.price);

    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: pkg.price,
        description: `Top-up ${pkg.credits} credits`,
        tag1: userId,
        tag2: "topup",
        tag3: pkg.credits,
      }),
    });

    const data = await res.json();
    console.log("QR Payment create response:", data);

    if (!data.success) {
      alert(data.error || "Failed to generate QR");
      setLoadingPkg(null);
      return;
    }

    await updateSession({
      step: "qr",
      qrCode: data.qrCode,
      transactionId: data.transactionId,
      expiresAt: Date.now() + 3 * 60 * 1000,
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-background rounded-xl">
      <h1 className="text-3xl font-bold text-center text-text-primary">{t("topup.title")}</h1>
      <p className="text-text-secondary text-center mt-1">
        {t("topup.subtitle")}
      </p>

      {/* Card Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <button
            key={pkg.price}
            onClick={() => choosePkg(pkg)}
            disabled={loadingPkg !== null}
            className={`relative group p-5 rounded-2xl border border-border
              shadow-sm hover:shadow-lg transition-all
              flex flex-col justify-between cursor-pointer
              active:scale-[0.98]
            `}
          >
            {/* Price */}
            <div className="text-xl font-bold text-primary">
              {pkg.price.toLocaleString()} {t("common.currncyLAK")}
            </div>

            {/* Credits */}
            <div className="mt-2 text-lg font-semibold">
              {pkg.credits} {t("common.credits")}
            </div>

            {/* Loading */}
            {loadingPkg === pkg.price && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs mt-4 text-center text-text-secondary">
        {t("topup.securePaymentInfo")}
      </p>
    </div>
  );
}
