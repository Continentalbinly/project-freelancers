"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { ArrowLeft } from "lucide-react";

// 💰 SSR-safe LAK formatter
function Money({ amount }: { amount: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <span>
      {new Intl.NumberFormat("lo-LA", {
        style: "currency",
        currency: "LAK",
        maximumFractionDigits: 0,
      }).format(amount)}
    </span>
  );
}

// 🧾 Transaction ID generator
function generateTransactionId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
}

export default function TopupPage() {
  const { t } = useTranslationContext();
  const { user } = useAuth();

  const [credit, setCredit] = useState<number>(0);
  const [topupAmount, setTopupAmount] = useState<number>(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 🔹 Load user credit
  useEffect(() => {
    async function loadCredit() {
      if (!user?.uid) return;
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setCredit(data.credit || 0);
      }
    }
    loadCredit();
  }, [user]);

  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  // 🔹 Handle Top-Up Payment
  async function handleConfirmPayment() {
    if (!user?.uid) {
      alert(t("topup.confirmation.login"));
      return;
    }
    if (topupAmount < 10000) {
      alert(t("topup.confirmation.min"));
      return;
    }

    setIsSubmitting(true);
    try {
      const txnId = generateTransactionId();

      await addDoc(collection(db, "transactions"), {
        transactionId: txnId,
        userId: user.uid,
        type: "topup",
        amount: topupAmount,
        status: "pending",
        paymentMethod: "QR_Manual",
        createdAt: serverTimestamp(),
      });

      setTransactionId(txnId);
      alert(t("topup.confirmation.success"));
    } catch (err) {
      //console.error(err);
      alert(t("topup.confirmation.failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
            {t("topup.title")}
          </h1>
          <p className="text-text-secondary mt-2">{t("topup.subtitle")}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-14">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-md">
            {/* Current Credit */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <span className="text-text-secondary font-medium">
                {t("topup.currentCredit")}
              </span>
              <span className="text-2xl font-bold text-primary">
                <Money amount={credit} />
              </span>
            </div>

            {/* Amount Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-text-primary">
                {t("topup.enterAmount")}
              </label>
              <input suppressHydrationWarning
                type="number"
                min={10000}
                step={10000}
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-text-secondary mt-1">
                {t("topup.tipAmount")}
              </p>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center mt-8">
              <div className="p-4 rounded-2xl border bg-gray-50">
                <Image
                  src="/images/assets/QR.jpeg"
                  alt="Top-up QR Code"
                  width={240}
                  height={240}
                  className="rounded-xl"
                  priority
                />
              </div>
              <p className="mt-3 text-sm text-text-secondary text-center">
                {t("topup.qrNote")}
              </p>
            </div>

            {/* Summary */}
            <div className="mt-8 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary font-medium">
                  {t("topup.amount")}
                </span>
                <span className="text-text-primary">
                  <Money amount={topupAmount} />
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-text-primary font-semibold">
                  {t("topup.total")}
                </span>
                <span className="text-2xl font-bold text-primary">
                  <Money amount={topupAmount} />
                </span>
              </div>
            </div>

            {/* Transaction Info */}
            {transactionId && (
              <div className="mt-6 p-3 border border-dashed border-primary/40 rounded-lg bg-primary/5 text-center">
                <p className="text-sm font-semibold text-text-primary">
                  {t("topup.transaction.idLabel")}
                </p>
                <p className="font-mono text-primary mt-1 text-base">
                  {transactionId}
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  {t("topup.transaction.note")}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button suppressHydrationWarning
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className={`btn btn-primary w-full px-6 py-3 rounded-xl font-semibold ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting
                  ? t("topup.processing")
                  : t("topup.confirmButton")}
              </button>

              <Link
                href="/dashboard"
                className="text-sm underline text-text-secondary"
              >
                <ArrowLeft className="w-4 h-4 inline-block mr-1" />
                {t("topup.back")}
              </Link>
            </div>

            {/* Tip */}
            <p className="text-[11px] text-text-secondary mt-4 text-center">
              {t("topup.tipNote")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
