"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import { toast } from "react-toastify";

const QR_EXPIRE_TIME = 180;

export default function StepPayoutClient({ project }: { project: any }) {
  const { t } = useTranslationContext();

  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrURL, setQrURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(QR_EXPIRE_TIME);
  const [expired, setExpired] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const pollInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  const amount = project.payoutAmount ?? project.budget ?? 0;

  const convertToQRImage = (raw: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
      raw
    )}`;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ----------------------------------------------------------
  // Load project → transactionId
  // ----------------------------------------------------------
  const loadProjectTransaction = async () => {
    const firestore = requireDb();
    const snap = await getDoc(doc(firestore, "projects", project.id));
    if (!snap.exists()) return toast.error("Project not found");

    const p = snap.data();
    if (!p.transactionId) return toast.error("Missing transaction ID");

    setTransactionId(p.transactionId);
    loadExistingQR(p.transactionId);
  };

  // ----------------------------------------------------------
  // Load QR from transaction
  // ----------------------------------------------------------
  const loadExistingQR = async (txId: string) => {
    const firestore = requireDb();
    const snap = await getDoc(doc(firestore, "transactions", txId));

    if (!snap.exists()) {
      setTimeout(() => loadExistingQR(txId), 800);
      return;
    }

    const tx = snap.data();

    if (!tx.qrCode || !tx.qrCreatedAt) {
      setExpired(true);
      return setLoading(false);
    }

    const createdAt = tx.qrCreatedAt.toMillis();
    const secondsPassed = Math.floor((Date.now() - createdAt) / 1000);
    const remaining = QR_EXPIRE_TIME - secondsPassed;

    if (remaining <= 0) {
      setExpired(true);
      return setLoading(false);
    }

    setQrURL(convertToQRImage(tx.qrCode));
    setTimer(remaining);

    startTimer();
    startPolling(txId);

    setLoading(false);
  };

  // ----------------------------------------------------------
  // Regenerate QR (spam-proof)
  // ----------------------------------------------------------
  const regenerateQR = async () => {
    if (!transactionId || isRegenerating) return;

    setIsRegenerating(true);

    // Haptic feedback for mobile
    if (navigator.vibrate) navigator.vibrate(40);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/regenerate?tx=${transactionId}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!data.success) throw new Error();

      const newTxId = data.transactionId;

      setTransactionId(newTxId);
      setQrURL(convertToQRImage(data.qrCode));
      setTimer(QR_EXPIRE_TIME);
      setExpired(false);

      clearInterval(timerInterval.current);
      clearInterval(pollInterval.current);

      startTimer();
      startPolling(newTxId);
    } catch (err) {
      toast.error(t("payout.regenerateError") ?? "Failed to regenerate QR");
    }

    setIsRegenerating(false);
  };

  // ----------------------------------------------------------
  // Timer countdown
  // ----------------------------------------------------------
  const startTimer = () => {
    clearInterval(timerInterval.current);

    timerInterval.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setExpired(true);
          clearInterval(timerInterval.current);
          clearInterval(pollInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ----------------------------------------------------------
  // Polling for payment confirmation
  // ----------------------------------------------------------
  const startPolling = (txId: string) => {
    clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      const firestore = requireDb();
      const snap = await getDoc(doc(firestore, "transactions", txId));
      if (snap.exists() && snap.data().status === "confirmed") {
        clearInterval(timerInterval.current);
        clearInterval(pollInterval.current);
        toast.success(t("payout.paymentConfirmed") ?? "Payment confirmed!");
        window.location.reload();
      }
    }, 2500);
  };

  // ----------------------------------------------------------
  // On mount
  // ----------------------------------------------------------
  useEffect(() => {
    loadProjectTransaction();
    return () => {
      clearInterval(timerInterval.current);
      clearInterval(pollInterval.current);
    };
  }, []);

  // ----------------------------------------------------------
  // Skeleton Loader
  // ----------------------------------------------------------
  if (loading)
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="w-64 h-64 mx-auto animate-pulse rounded-xl mb-6"></div>
        <p className="text-gray-500 text-lg animate-pulse">
          {t("common.loading")}...
        </p>
      </div>
    );

  // ----------------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------------
  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-sm p-6 text-center border border-gray-100 animate-fadeIn">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-2">{t("payout.title")}</h2>

      {/* Amount */}
      <p className="text-gray-600 mb-6">
        {t("payout.scanToPay")} —{" "}
        <span className="font-semibold">{amount.toLocaleString()} LAK</span>
      </p>

      {/* QR Image */}
      {!expired && qrURL && (
        <div className="mx-auto w-64 h-64 mb-4 rounded-xl shadow-md overflow-hidden border border-gray-200">
          <img
            src={qrURL}
            alt="QR Code"
            className="w-full h-full object-cover animate-fadeIn select-none pointer-events-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}

      {/* Expired Message */}
      {expired && (
        <div className="text-red-500 text-md mb-3 font-semibold animate-fadeIn">
          {t("payout.qrExpired")}
        </div>
      )}

      {/* Timer OR Regenerate Button */}
      {!expired ? (
        <>
          <div className="w-full h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-linear"
              style={{ width: `${(timer / QR_EXPIRE_TIME) * 100}%` }}
            />
          </div>

          <p className="mt-2 text-gray-500">
            {t("topup.expiresIn")}{" "}
            <span className="font-bold text-red-600">{formatTime(timer)}</span>
          </p>

          <p className="text-xs text-gray-400 mt-1 animate-pulse">
            {t("payout.autoUpdating") ?? "Updating..."}
          </p>
        </>
      ) : (
        <button
          onClick={regenerateQR}
          disabled={isRegenerating}
          className={`mt-4 px-5 py-3 rounded-xl shadow text-white transition cursor-pointer
            ${
              isRegenerating
                ? "cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
        >
          {isRegenerating
            ? t("payout.regenerating") ?? "Generating..."
            : t("payout.regenerateQR") ?? "Regenerate QR"}
        </button>
      )}

      {/* Copy Transaction ID */}
      {transactionId && (
        <p className="mt-4 text-xs text-gray-400">
          ID: {transactionId}{" "}
          <button
            className="text-blue-500 underline ml-1 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(transactionId);
              toast.success(t("common.copied") ?? "Copied!");
            }}
          >
            {t("common.copy") ?? "Copy"}
          </button>
        </p>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4">
        {t("payout.securePayment") ?? "Secure payment powered by PhayJay"}
      </p>
    </div>
  );
}
