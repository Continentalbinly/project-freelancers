"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { toast } from "react-toastify";
import type { Order } from "@/types/order";

const QR_EXPIRE_TIME = 180;

interface OrderPaymentStepProps {
  order: Order;
  onPaymentConfirmed?: () => void;
}

export default function OrderPaymentStep({ order, onPaymentConfirmed }: OrderPaymentStepProps) {
  const { t } = useTranslationContext();

  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrURL, setQrURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(QR_EXPIRE_TIME);
  const [expired, setExpired] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const pollInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  const amount = order.packagePrice ?? order.price ?? 0;

  const convertToQRImage = (raw: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
      raw
    )}`;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Load order transaction
  const loadOrderTransaction = async () => {
    const snap = await getDoc(doc(db, "orders", order.id));
    if (!snap.exists()) return toast.error("Order not found");

    const o = snap.data();
    if (!o.transactionId) return toast.error("Missing transaction ID");

    setTransactionId(o.transactionId);
    loadExistingQR(o.transactionId);
  };

  // Load QR from transaction
  const loadExistingQR = async (txId: string) => {
    const snap = await getDoc(doc(db, "transactions", txId));

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

  // Regenerate QR
  const regenerateQR = async () => {
    if (!transactionId || isRegenerating) return;

    setIsRegenerating(true);

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

  // Timer countdown
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

  // Polling for payment confirmation
  const startPolling = (txId: string) => {
    clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      const snap = await getDoc(doc(db, "transactions", txId));
      if (snap.exists() && snap.data().status === "confirmed") {
        clearInterval(timerInterval.current);
        clearInterval(pollInterval.current);
        toast.success(t("payout.paymentConfirmed") ?? "Payment confirmed!");
        if (onPaymentConfirmed) {
          onPaymentConfirmed();
        } else {
          window.location.reload();
        }
      }
    }, 2500);
  };

  // On mount
  useEffect(() => {
    loadOrderTransaction();
    return () => {
      clearInterval(timerInterval.current);
      clearInterval(pollInterval.current);
    };
  }, []);

  // Skeleton Loader
  if (loading)
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="w-64 h-64 mx-auto animate-pulse rounded-xl mb-6"></div>
        <p className="text-gray-500 text-lg animate-pulse">
          {t("common.loading")}...
        </p>
      </div>
    );

  // UI Rendering
  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
        {t("payout.title") || "Complete Payment"}
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        {t("payout.scanToPay") || "Scan to pay"} —{" "}
        <span className="font-semibold">{amount.toLocaleString()} LAK</span>
      </p>

      {/* QR Image */}
      {!expired && qrURL && (
        <div className="mx-auto w-64 h-64 mb-4 rounded-xl shadow-md overflow-hidden border border-border">
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
          {t("payout.qrExpired") || "QR Code Expired"}
        </div>
      )}

      {/* Timer OR Regenerate Button */}
      {!expired ? (
        <>
          <div className="w-full h-2 rounded-full mt-4 overflow-hidden bg-border">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-linear"
              style={{ width: `${(timer / QR_EXPIRE_TIME) * 100}%` }}
            />
          </div>

          <p className="mt-2 text-sm text-text-secondary text-center">
            {t("topup.expiresIn") || "Expires in"}{" "}
            <span className="font-bold text-red-600">{formatTime(timer)}</span>
          </p>

          <p className="text-xs text-text-secondary mt-1 text-center animate-pulse">
            {t("payout.autoUpdating") ?? "Updating..."}
          </p>
        </>
      ) : (
        <button
          onClick={regenerateQR}
          disabled={isRegenerating}
          className={`w-full mt-4 px-5 py-3 rounded-lg font-medium transition
            ${
              isRegenerating
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 active:scale-95 cursor-pointer"
            }`}
        >
          {isRegenerating
            ? t("payout.regenerating") ?? "Generating..."
            : t("payout.regenerateQR") ?? "Regenerate QR"}
        </button>
      )}

      {/* Copy Transaction ID */}
      {transactionId && (
        <p className="mt-4 text-xs text-text-secondary text-center">
          ID: {transactionId.substring(0, 12)}...{" "}
          <button
            className="text-primary hover:underline cursor-pointer ml-1"
            onClick={() => {
              navigator.clipboard.writeText(transactionId);
              toast.success(t("common.copy") ?? "Copied!");
            }}
          >
            {t("common.copy") ?? "Copy"}
          </button>
        </p>
      )}

      {/* Footer */}
      <p className="text-xs text-text-secondary text-center mt-4">
        {t("payout.securePayment") ?? "Secure payment powered by PhayJay"}
      </p>
    </div>
  );
}
