"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function WithdrawForm({ user, profile }: any) {
  const { t } = useTranslationContext();
  const [accountName, setAccountName] = useState(profile.fullName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const credit = profile.credit || 0;
  const totalEarned = profile.totalEarned || 0;
  const totalBalance = credit + totalEarned;
  const isFreelancerStudent = profile.occupation === "freelancer_student";

  const feePercent = isFreelancerStudent ? 0 : 0.005;
  const feeAmount = Number(amount) * feePercent;
  const netAmount = Number(amount) - feeAmount;

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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validateAmount()) return;
    setShowConfirm(true);
  };

  const handleWithdrawAll = () => {
    if (source === "credit") setAmount(String(credit));
    else if (source === "totalEarned") setAmount(String(totalEarned));
    else setAmount(String(totalBalance));
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
          source,
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
        className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5"
      >
        <h2 className="text-xl font-bold text-gray-800 tracking-wide">
          {t("withdraw.title")}
        </h2>

        {/* Floating input */}
        <div className="relative">
          <label className="text-gray-500 text-xs transition-all peer-focus:text-primary">
            {t("withdraw.accountName")}
          </label>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="peer w-full bg-white/40 backdrop-blur-xl border border-gray-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="relative">
          <label className="text-gray-500 text-xs transition-all peer-focus:text-primary">
            {t("withdraw.accountNumber")}
          </label>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
            className="peer w-full bg-white/40 border border-gray-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Source Dropdown */}
        <div>
          <label className="text-xs text-gray-500">
            {t("withdraw.withdrawFrom")}
          </label>
          <select
            className="w-full mt-1 bg-white/40 border border-gray-300 px-3 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="credit">{t("withdraw.options.credit")}</option>
            <option value="totalEarned">
              {t("withdraw.options.totalEarned")}
            </option>
            <option value="all">{t("withdraw.options.all")}</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
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
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/40 border border-gray-300 px-3 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 bg-red-50 border border-red-200 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white cursor-pointer font-semibold shadow transition ${
            loading ? "bg-gray-400" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {loading ? t("withdraw.processing") : t("withdraw.submit")}
        </button>

        {message && (
          <div className="text-center text-sm mt-2 font-medium">{message}</div>
        )}
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-3">
            <h3 className="text-lg font-bold text-center">
              {t("withdraw.confirm.title")}
            </h3>

            <div className="text-sm text-gray-600 space-y-1">
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

              {source === "all" && (
                <p className="text-xs text-gray-500">
                  {credit.toLocaleString()} + {totalEarned.toLocaleString()} LAK
                </p>
              )}

              <p>
                <strong>{t("withdraw.confirm.fee")}:</strong>{" "}
                {isFreelancerStudent ? "0" : feeAmount.toLocaleString()} LAK
              </p>

              <p>
                <strong>{t("withdraw.confirm.net")}:</strong>{" "}
                {netAmount.toLocaleString()} LAK
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 backdrop-blur-md"
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
