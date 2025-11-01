"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface WithdrawFormProps {
  user: any;
  profile: any;
}

export default function WithdrawForm({ user, profile }: WithdrawFormProps) {
  const { t } = useTranslationContext();
  const [accountName, setAccountName] = useState(profile.fullName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const credit = profile.credit || 0;
  const totalEarned = profile.totalEarned || 0;
  const totalBalance = credit + totalEarned;
  const isFreelancerStudent = profile.occupation === "freelancer_student";

  const feePercent = isFreelancerStudent ? 0 : 0.005;
  const feeAmount = Number(amount) * feePercent;
  const netAmount = Number(amount) - feeAmount;

  // 🧮 Validation
  const validateAmount = (): boolean => {
    const amt = Number(amount);
    if (amt <= 0 || isNaN(amt)) {
      setError(t("withdraw.errors.invalidAmount"));
      return false;
    }

    if (source === "credit" && amt > credit) {
      setError(t("withdraw.errors.insufficientCredit"));
      return false;
    }

    if (source === "totalEarned" && amt > totalEarned) {
      setError(t("withdraw.errors.insufficientTotalEarned"));
      return false;
    }

    if (source === "all" && amt > totalBalance) {
      setError(t("withdraw.errors.insufficientBalance"));
      return false;
    }

    setError("");
    return true;
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAmount()) return;
    setShowConfirm(true);
  };

  const confirmWithdraw = async () => {
    setLoading(true);
    setShowConfirm(false);
    setMessage("");

    try {
      const res = await fetch("/api/requestWithdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          accountName,
          accountNumber,
          amount: Number(amount),
          source,
          fee: feeAmount,
          netAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(t("withdraw.success"));
        setAmount("");
        setAccountNumber("");
      } else {
        setMessage("❌ " + (data.error || t("withdraw.errors.failed")));
      }
    } catch (err) {
      setMessage(t("withdraw.errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  // 🧩 NEW: handle "Withdraw All" button click
  const handleWithdrawAll = () => {
    if (source === "credit") setAmount(String(credit));
    else if (source === "totalEarned") setAmount(String(totalEarned));
    else if (source === "all") setAmount(String(totalBalance));
  };

  return (
    <>
      <form
        onSubmit={handleWithdraw}
        className="bg-white border border-border rounded-xl p-4 sm:p-6 shadow-md space-y-4"
      >
        <h2 className="font-semibold text-lg text-text-primary mb-3">
          {t("withdraw.title")}
        </h2>

        {/* 💰 Balance Overview */}
        <div className="text-sm text-gray-600 mb-2">
          <p>
            {t("withdraw.creditBalance")}:{" "}
            <span className="font-semibold text-primary">
              {credit.toLocaleString()} LAK
            </span>
          </p>
          <p>
            {t("withdraw.totalEarned")}:{" "}
            <span className="font-semibold text-secondary">
              {totalEarned.toLocaleString()} LAK
            </span>
          </p>
        </div>

        {/* 🏦 Account Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-text-secondary">
            {t("withdraw.accountName")}
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 💳 Account Number */}
        <div>
          <label className="block text-sm font-medium mb-1 text-text-secondary">
            {t("withdraw.accountNumber")}
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 📂 Withdraw Source */}
        <div>
          <label className="block text-sm font-medium mb-1 text-text-secondary">
            {t("withdraw.withdrawFrom")}
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          >
            <option value="credit">{t("withdraw.options.credit")}</option>
            <option value="totalEarned">
              {t("withdraw.options.totalEarned")}
            </option>
            <option value="all">{t("withdraw.options.all")}</option>
          </select>
        </div>

        {/* 💸 Amount Field with “All” Button */}
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-text-secondary">
              {t("withdraw.amount")}
            </label>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("withdraw.allButton")}
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={1}
            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* ⚠️ Error Message */}
        {error && (
          <p className="text-center text-sm text-error bg-error/10 border border-error/20 py-2 rounded-md">
            {error}
          </p>
        )}

        {/* 🟢 Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full cursor-pointer font-semibold py-2 rounded-lg text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {loading ? t("withdraw.processing") : t("withdraw.submit")}
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-3 ${
              message.startsWith("✅")
                ? "text-success"
                : message.startsWith("⚠️")
                ? "text-warning"
                : "text-error"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      {/* 💬 Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3 text-center">
              {t("withdraw.confirm.title")}
            </h3>

            <div className="space-y-1 text-sm text-gray-700 mb-4">
              <p>
                <strong>{t("withdraw.confirm.from")}:</strong>{" "}
                {source === "all"
                  ? t("withdraw.options.all")
                  : t(`withdraw.options.${source}`)}
              </p>
              <p>
                <strong>{t("withdraw.confirm.amount")}:</strong>{" "}
                {Number(amount).toLocaleString()} LAK
              </p>

              {/* Show breakdown only when source = all */}
              {source === "all" && (
                <p className="text-xs text-gray-500">
                  {t("withdraw.confirm.breakdownPrefix") +
                    credit.toLocaleString() +
                    " LAK " +
                    t("withdraw.confirm.breakdownMid") +
                    totalEarned.toLocaleString() +
                    " LAK " +
                    t("withdraw.confirm.breakdownSuffix")}
                </p>
              )}

              <p>
                <strong>{t("withdraw.confirm.fee")}:</strong>{" "}
                {isFreelancerStudent
                  ? t("withdraw.confirm.noFee")
                  : `${feeAmount.toLocaleString()} LAK (0.5%)`}
              </p>
              <p>
                <strong>{t("withdraw.confirm.net")}:</strong>{" "}
                {netAmount.toLocaleString()} LAK
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 cursor-pointer py-2 rounded-md border border-border text-gray-700 hover:bg-gray-100"
              >
                {t("withdraw.confirm.cancel")}
              </button>
              <button
                onClick={confirmWithdraw}
                className="px-4 cursor-pointer py-2 rounded-md bg-primary text-white hover:bg-primary-hover"
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
