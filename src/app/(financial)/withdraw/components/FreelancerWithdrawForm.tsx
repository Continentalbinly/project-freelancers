"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

const formatCurrency = (value: string): string => {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
};

const parseAmount = (value: string): number => {
  return Number(value.replace(/\D/g, "")) || 0;
};

export default function FreelancerWithdrawForm({ user, profile }: any) {
  const { t } = useTranslationContext();
  const [accountName, setAccountName] = useState(profile.fullName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalEarned = profile.totalEarned || 0;
  const feePercent = 0.005; // 0.5% fee
  const parsedAmount = parseAmount(amount);
  const feeAmount = parsedAmount * feePercent;
  const netAmount = parsedAmount - feeAmount;

  const validateAmount = (): boolean => {
    const amt = parseAmount(amount);
    if (amt <= 0) {
      setError(t("withdraw.errors.invalidAmount") || "Invalid amount");
      return false;
    }
    if (amt > totalEarned) {
      setError(t("withdraw.errors.insufficientTotalEarned") || "Insufficient earned balance");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validateAmount()) return;
    setShowConfirm(true);
  };

  const handleWithdrawAll = () => {
    setAmount(formatCurrency(String(totalEarned)));
  };

  const confirmWithdraw = async () => {
    setLoading(true);
    setShowConfirm(false);

    try {
      const res = await fetch("/api/requestWithdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          accountName,
          accountNumber,
          amount: Number(amount),
          source: "totalEarned",
          fee: feeAmount,
          netAmount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ " + t("withdraw.success"));
        setAmount("");
        setAccountNumber("");
      } else {
        setMessage("❌ " + (data.error || t("withdraw.errors.failed")));
      }
    } catch {
      setMessage("❌ " + t("withdraw.errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl border border-border bg-background rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5"
      >
        <h2 className="text-xl font-bold text-text-primary tracking-wide">
          {t("withdraw.options.totalEarned")}
        </h2>

        <p className="text-sm text-text-secondary">
          {t("withdraw.freelancer.description") || "Withdraw your earned income to your bank account."}
        </p>

        {/* Floating input */}
        <div className="relative">
          <label className="text-text-secondary text-xs transition-all peer-focus:text-primary">
            {t("withdraw.accountName")}
          </label>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="peer w-full backdrop-blur-xl border border-border rounded-xl px-3 py-3 bg-background text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="relative">
          <label className="text-text-secondary text-xs transition-all peer-focus:text-primary">
            {t("withdraw.accountNumber")}
          </label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="peer w-full border border-border rounded-xl px-3 py-3 bg-background text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>{t("withdraw.amount")}</span>

            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-primary font-medium"
            >
              {t("withdraw.allButton")}
            </button>
          </div>

          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatCurrency(e.target.value))}
            className="w-full border border-border px-3 py-3 rounded-xl bg-background text-text-primary focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {error && (
          <p className="text-center text-sm text-error bg-error/10 border border-error/30 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white cursor-pointer font-semibold shadow transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {loading ? t("withdraw.processing") : t("withdraw.submit")}
        </button>

        {message && (
          <div className="text-center text-sm mt-2 font-medium text-text-primary">{message}</div>
        )}
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-3 bg-background border border-border">
            <h3 className="text-lg font-bold text-center">
              {t("withdraw.confirm.title")}
            </h3>

            <div className="text-sm text-text-secondary space-y-1">
              <p>
                <strong>{t("withdraw.confirm.from")}:</strong>{" "}
                {t("withdraw.options.totalEarned")}
              </p>

              <p>
                <strong>{t("withdraw.confirm.amount") || "Amount"}:</strong>{" "}
                {parseAmount(amount).toLocaleString()} LAK
              </p>

              <p>
                <strong>{t("withdraw.confirm.fee") || "Fee"}:</strong>{" "}
                {Math.round(feeAmount).toLocaleString()} LAK
              </p>

              <p>
                <strong>{t("withdraw.confirm.net") || "Net"}:</strong>{" "}
                {Math.round(netAmount).toLocaleString()} LAK
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border border-border bg-background text-text-primary"
              >
                {t("withdraw.confirm.cancel")}
              </button>
              <button
                onClick={confirmWithdraw}
                className="px-4 py-2 rounded-xl bg-primary text-white"
              >
                {t("withdraw.confirm.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
