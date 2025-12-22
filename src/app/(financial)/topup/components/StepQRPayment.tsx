"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { TopupSession, UpdateSessionFunction } from "@/types/topup";

interface StepQRPaymentProps {
  session: TopupSession | null;
  updateSession: UpdateSessionFunction;
  t: (key: string) => string;
}

export default function StepQRPayment({ session, updateSession, t }: StepQRPaymentProps) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((session?.expiresAt || 0) - Date.now()) / 1000)
  );

  const [qrLoaded, setQrLoaded] = useState(false);

  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const qrURL = session?.qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(session.qrCode)}`
    : "";

  if (!session) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------
  // TIMER: countdown
  // -------------------------------
  useEffect(() => {
    if (!session?.expiresAt) return;

      timerInterval.current = setInterval(() => {
      const left = Math.floor((session!.expiresAt! - Date.now()) / 1000);

      setRemaining(left);

        if (left <= 0) {
        // ❗ DO NOT expire if payment succeeded
        if (session!.status !== "confirmed") {
          updateSession({ step: "expired" });
        }
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      }
    }, 1000);

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [session?.expiresAt, session?.status, updateSession, session]);

  // -------------------------------
  // POLLING: check Firestore for success
  // -------------------------------
  useEffect(() => {
    const txId = session?.transactionId;
    if (!txId) return;

    pollInterval.current = setInterval(async () => {
      const firestore = requireDb();
      const snap = await getDoc(doc(firestore, "transactions", txId));

      if (snap.exists() && snap.data().status === "confirmed") {
        if (timerInterval.current) {
          clearInterval(timerInterval.current); // stop countdown
        }
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
        }

        updateSession({ status: "confirmed", step: "success" });
      }
    }, 2000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [session?.transactionId, updateSession, session]);

  // -------------------------------
  // REACT to session.status change
  // -------------------------------
  useEffect(() => {
    if (session?.status === "confirmed") {
      updateSession({ step: "success" });
    }
  }, [session?.status, updateSession]);

  return (
    <div className="max-w-lg mx-auto text-center p-6 bg-background rounded-xl">
      <h1 className="text-xl font-bold text-primary">{t("topup.scanQR")}</h1>
      <p className="text-text-secondary mt-2">{t("topup.scanWithBankApp")}</p>

      {/* QR Block */}
      <div className="mt-6 flex justify-center">
        <div className="p-4 border border-border rounded-2xl shadow-sm bg-background-secondary">
          <div className="relative w-[240px] h-[240px]">
            {!qrLoaded && (
              <div className="absolute inset-0 rounded-lg animate-pulse" />
            )}

            <Image
              src={qrURL}
              alt="QR Code"
              onLoad={() => setQrLoaded(true)}
              className={`absolute inset-0 rounded-lg transition-opacity duration-500 ${
                qrLoaded ? "opacity-100" : "opacity-0"
              }`}
              width={240}
              height={240}
            />
          </div>
        </div>
      </div>

      {/* Countdown */}
      <p className="text-sm mt-4 text-text-secondary">
        {t("topup.expiresIn")} {formatTime(remaining)}
      </p>

      {/* Expired Message */}
      {remaining <= 0 && session?.status !== "confirmed" && (
        <p className="text-error font-medium mt-2">{t("topup.expired")}</p>
      )}
    </div>
  );
}
