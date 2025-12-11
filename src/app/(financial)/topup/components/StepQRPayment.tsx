"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/service/firebase";

export default function StepQRPayment({ session, updateSession, t }: any) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
  );

  const [qrLoaded, setQrLoaded] = useState(false);

  const pollInterval = useRef<any>(null);
  const timerInterval = useRef<any>(null);

  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    session.qrCode
  )}`;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------
  // TIMER: countdown
  // -------------------------------
  useEffect(() => {
    if (!session.expiresAt) return;

    timerInterval.current = setInterval(() => {
      const left = Math.floor((session.expiresAt - Date.now()) / 1000);

      setRemaining(left);

      if (left <= 0) {
        // ❗ DO NOT expire if payment succeeded
        if (session.status !== "confirmed") {
          updateSession({ step: "expired" });
        }
        clearInterval(timerInterval.current);
      }
    }, 1000);

    return () => clearInterval(timerInterval.current);
  }, [session.expiresAt]);

  // -------------------------------
  // POLLING: check Firestore for success
  // -------------------------------
  useEffect(() => {
    const txId = session.transactionId;
    if (!txId) return;

    pollInterval.current = setInterval(async () => {
      const snap = await getDoc(doc(db, "transactions", txId));

      if (snap.exists() && snap.data().status === "confirmed") {
        clearInterval(timerInterval.current); // stop countdown
        clearInterval(pollInterval.current);

        updateSession({ status: "confirmed", step: "success" });
      }
    }, 2000);

    return () => clearInterval(pollInterval.current);
  }, [session.transactionId]);

  // -------------------------------
  // REACT to session.status change
  // -------------------------------
  useEffect(() => {
    if (session.status === "confirmed") {
      updateSession({ step: "success" });
    }
  }, [session.status]);

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

            <img
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
      {remaining <= 0 && session.status !== "confirmed" && (
        <p className="text-error font-medium mt-2">{t("topup.expired")}</p>
      )}
    </div>
  );
}
