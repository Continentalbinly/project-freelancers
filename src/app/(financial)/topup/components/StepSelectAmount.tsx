"use client";

import { useState } from "react";
import { Loader2, CreditCard, Sparkles, Shield, CheckCircle2 } from "lucide-react";

// Updated packages with progressive credit amounts
// Higher prices give better credit rates to incentivize larger topups
// Credits increase more than proportionally to prevent users from getting less credits 
// by doing multiple smaller topups vs one larger topup
const packages = [
  { price: 10000, credits: 30, popular: false },   // Base rate: 333 LAK/credit
  { price: 20000, credits: 65, popular: true },    // Better rate: 308 LAK/credit (65 > 30*2)
  { price: 30000, credits: 100, popular: false },  // Better rate: 300 LAK/credit (100 > 65*1.5)
  { price: 50000, credits: 170, popular: false },  // Better rate: 294 LAK/credit (170 > 100*1.67)
  { price: 100000, credits: 350, popular: false }, // Better rate: 286 LAK/credit (350 > 170*2)
  { price: 200000, credits: 720, popular: false }, // Better rate: 278 LAK/credit (720 > 350*2)
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

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pkg.price,
          description: `Top-up ${pkg.credits} credits`,
          tag1: userId,
          tag2: "topup",
          tag3: pkg.credits, // This is correctly passed to webhook which uses increment()
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
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment. Please try again.");
      setLoadingPkg(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 dark:from-primary/30 to-secondary/20 dark:to-secondary/30 mb-4">
          <CreditCard className="w-8 h-8 text-primary dark:text-primary/90" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-gray-100 mb-2">
          {t("topup.title") || "Top Up Credits"}
        </h1>
        <p className="text-text-secondary dark:text-gray-400 text-lg">
          {t("topup.subtitle") || "Choose an amount to add credits to your account"}
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {packages.map((pkg) => (
          <button
            key={pkg.price}
            onClick={() => choosePkg(pkg)}
            disabled={loadingPkg !== null}
            className={`relative group p-6 rounded-2xl border-2 transition-all duration-300
              flex flex-col items-center justify-between cursor-pointer
              active:scale-[0.98] min-h-[180px]
              ${
                pkg.popular
                  ? "border-primary bg-gradient-to-br from-primary/5 dark:from-primary/10 to-primary/10 dark:to-primary/20 shadow-lg shadow-primary/20 dark:shadow-primary/30 hover:shadow-xl hover:shadow-primary/30 dark:hover:shadow-primary/40"
                  : "border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/50 hover:border-primary dark:hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 dark:hover:from-primary/10 hover:to-primary/10 dark:hover:to-primary/20 hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30"
              }
              ${loadingPkg !== null && loadingPkg !== pkg.price ? "opacity-50 dark:opacity-40 cursor-not-allowed" : ""}
              ${loadingPkg === pkg.price ? "pointer-events-none" : ""}
            `}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md dark:shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t("topup.popular") || "Popular"}
                </span>
              </div>
            )}

            {/* Loading Overlay */}
            {loadingPkg === pkg.price && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/90 dark:bg-gray-900/95 backdrop-blur-sm z-10 border-2 border-primary/20 dark:border-primary/30">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-primary dark:text-primary/90 w-8 h-8" />
                  <span className="text-xs font-medium text-text-secondary dark:text-gray-300">Loading...</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="w-full flex flex-col items-center space-y-4">
              {/* Credits - Main Focus */}
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:from-primary dark:to-secondary">
                  {pkg.credits}
                </div>
                <div className="text-sm font-medium text-text-secondary dark:text-gray-400 mt-1">
                  {t("common.credits") || "Credits"}
                </div>
              </div>

              {/* Price */}
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary dark:text-gray-100">
                  {pkg.price.toLocaleString("lo-LA")}
                </div>
                <div className="text-sm text-text-secondary dark:text-gray-400">
                  {t("common.currncyLAK") || "LAK"}
                </div>
              </div>
            </div>

          </button>
        ))}
      </div>

      {/* Security Info */}
      <div className="mt-8 p-4 rounded-xl bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-success dark:text-success/90 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary dark:text-gray-100 mb-1">
            {t("topup.securePayment") || "Secure Payment"}
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
            {t("topup.securePaymentInfo") || "Your payment is secure and credits are added instantly."}
          </p>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-text-secondary dark:text-gray-400">
          {t("topup.creditsInfo") || "Credits are added to your account immediately after successful payment. You can top up multiple times and credits will accumulate."}
        </p>
      </div>
    </div>
  );
}
