"use client";

import { useState } from "react";
import { CreditCard, Info, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { User as FirebaseUser } from "firebase/auth";
import type { Profile } from "@/types/profile";

interface FreelancerWithdrawFormProps {
  user: FirebaseUser;
  profile: Profile;
}

const formatCurrency = (value: string): string => {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
};

const parseAmount = (value: string): number => {
  return Number(value.replace(/\D/g, "")) || 0;
};

export default function FreelancerWithdrawForm({ user, profile }: FreelancerWithdrawFormProps) {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      const parsedAmt = parseAmount(amount);
      if (parsedAmt <= 0 || parsedAmt > totalEarned) {
        setMessage("❌ " + (t("withdraw.errors.invalidAmount") || "Invalid amount"));
        setLoading(false);
        return;
      }

      const res = await fetch("/api/requestWithdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          accountName,
          accountNumber,
          amount: parsedAmt, // ✅ Fixed: Use parsed amount, not formatted string
          source: "totalEarned",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ " + (t("withdraw.success") || "Withdrawal request submitted successfully!"));
        setAmount("");
        setAccountNumber("");
        setError("");
        // Clear success message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
      } else {
        setError(data.error || t("withdraw.errors.failed") || "Failed to submit withdrawal request");
        setMessage("");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("withdraw.errors.unknown") || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border mt-4 border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/50 p-6 md:p-8 shadow-sm space-y-6"
      >

        {/* Bank Account Details */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-2">
              {t("withdraw.accountName") || "Account Holder Name"}
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              className="w-full border border-border dark:border-gray-700 rounded-xl px-4 py-3 bg-background dark:bg-gray-900 text-text-primary dark:text-gray-100 placeholder-text-secondary dark:placeholder-gray-500 focus:ring-2 focus:ring-primary dark:focus:ring-primary/50 focus:border-transparent outline-none transition-all"
              placeholder={t("withdraw.accountNamePlaceholder") || "Enter account holder name"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-gray-200 mb-2">
              {t("withdraw.accountNumber") || "Bank Account Number"}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full border border-border dark:border-gray-700 rounded-xl px-4 py-3 bg-background dark:bg-gray-900 text-text-primary dark:text-gray-100 placeholder-text-secondary dark:placeholder-gray-500 focus:ring-2 focus:ring-primary dark:focus:ring-primary/50 focus:border-transparent outline-none transition-all"
              placeholder={t("withdraw.accountNumberPlaceholder") || "Enter bank account number"}
            />
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-primary dark:text-gray-200">
              {t("withdraw.amount") || "Withdrawal Amount"}
            </label>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t("withdraw.allButton") || "Withdraw All"}
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatCurrency(e.target.value))}
              className="w-full border border-border dark:border-gray-700 rounded-xl px-4 py-3 bg-background dark:bg-gray-900 text-text-primary dark:text-gray-100 placeholder-text-secondary dark:placeholder-gray-500 focus:ring-2 focus:ring-primary dark:focus:ring-primary/50 focus:border-transparent outline-none transition-all text-lg font-semibold"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-gray-400 text-sm font-medium">
              LAK
            </div>
          </div>

          {/* Available Balance Info */}
          <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">
            {t("withdraw.availableBalance") || "Available"}: <span className="font-semibold text-success">{totalEarned.toLocaleString()} LAK</span>
          </p>
        </div>

        {/* Fee Calculation Preview */}
        {parsedAmount > 0 && (
          <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary dark:text-gray-200">
                {t("withdraw.feeBreakdown") || "Fee Breakdown"}
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-text-secondary dark:text-gray-400">
                <span>{t("withdraw.withdrawalAmount") || "Withdrawal Amount"}:</span>
                <span className="font-medium text-text-primary dark:text-gray-200">{parsedAmount.toLocaleString()} LAK</span>
              </div>
              <div className="flex justify-between text-text-secondary dark:text-gray-400">
                <span>{t("withdraw.processingFee") || "Processing Fee"} (0.5%):</span>
                <span className="font-medium text-text-primary dark:text-gray-200">-{Math.round(feeAmount).toLocaleString()} LAK</span>
              </div>
              <div className="flex justify-between text-success font-semibold pt-2 border-t border-primary/20 dark:border-primary/30">
                <span>{t("withdraw.netAmount") || "Amount You'll Receive"}:</span>
                <span>{Math.round(netAmount).toLocaleString()} LAK</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-error/10 dark:bg-error/20 border border-error/20 dark:border-error/30">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && !error && (
          <div className={`flex items-start gap-3 p-4 rounded-xl ${
            message.startsWith("✅") 
              ? "bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30"
              : "bg-error/10 dark:bg-error/20 border border-error/20 dark:border-error/30"
          }`}>
            {message.startsWith("✅") ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${
              message.startsWith("✅") ? "text-success" : "text-error"
            }`}>
              {message.replace(/^[✅❌]\s*/, "")}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || parsedAmount <= 0 || parsedAmount > totalEarned}
          className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all flex items-center justify-center gap-2 ${
            loading || parsedAmount <= 0 || parsedAmount > totalEarned
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-linear-to-r from-primary to-primary-hover hover:from-primary/90 hover:to-primary-hover/90 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("withdraw.processing") || "Processing..."}
            </>
          ) : (
            t("withdraw.submit") || "Request Withdrawal"
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl bg-background dark:bg-gray-900 border border-border dark:border-gray-700 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                {t("withdraw.confirm.title") || "Confirm Withdrawal"}
              </h3>
              <p className="text-sm text-text-secondary dark:text-gray-400">
                {t("withdraw.confirm.subtitle") || "Please review your withdrawal details"}
              </p>
            </div>

            <div className="rounded-xl bg-background-secondary dark:bg-gray-800/50 p-4 space-y-3 border border-border dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary dark:text-gray-400">{t("withdraw.confirm.from") || "Source"}:</span>
                <span className="font-medium text-text-primary dark:text-gray-200">{t("withdraw.options.totalEarned") || "Total Earned"}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary dark:text-gray-400">{t("withdraw.confirm.amount") || "Amount"}:</span>
                <span className="font-semibold text-text-primary dark:text-gray-100">{parsedAmount.toLocaleString()} LAK</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary dark:text-gray-400">{t("withdraw.confirm.fee") || "Processing Fee"}:</span>
                <span className="font-medium text-text-primary dark:text-gray-200">-{Math.round(feeAmount).toLocaleString()} LAK</span>
              </div>

              <div className="pt-3 border-t border-border dark:border-gray-700 flex justify-between items-center">
                <span className="font-semibold text-text-primary dark:text-gray-100">{t("withdraw.confirm.net") || "Net Amount"}:</span>
                <span className="text-xl font-bold text-success">{Math.round(netAmount).toLocaleString()} LAK</span>
              </div>

              <div className="pt-2 space-y-2 text-xs text-text-secondary dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t("withdraw.confirm.note") || "Processing typically takes 1-3 business days."}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800 text-text-primary dark:text-gray-200 font-medium hover:bg-background-tertiary dark:hover:bg-gray-700 transition-colors"
              >
                {t("withdraw.confirm.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmWithdraw}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-linear-to-r from-primary to-primary-hover text-white font-semibold hover:from-primary/90 hover:to-primary-hover/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("withdraw.processing") || "Processing..."}
                  </>
                ) : (
                  t("withdraw.confirm.confirm") || "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
