"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  doc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";

// 💰 constants
const AMOUNT_LAK = 50000;

// 🔹 SSR-safe LAK formatter
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

// 🔹 Generate friendly transaction ID
function generateTransactionId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
}

export default function SubscribePageLAK() {
  const { t } = useTranslationContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  // ✅ Handle Confirm Payment
  async function handleConfirmPayment() {
    if (!user?.uid) {
      alert(t("pay.confirmation.login"));
      return;
    }

    setIsSubmitting(true);
    try {
      // 1️⃣ Generate readable transaction ID
      const txnId = generateTransactionId();

      // 2️⃣ Add to Firestore
      const ref = collection(db, "transactions");
      await addDoc(ref, {
        transactionId: txnId,
        userId: user.uid,
        amount: AMOUNT_LAK,
        type: "subscription",
        plan: "pro",
        status: "pending",
        paymentMethod: "QR_Manual",
        createdAt: serverTimestamp(),
      });

      // 3️⃣ Update user profile → pending
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        plan: "pro",
        planStatus: "pending",
        planStartDate: null,
        planEndDate: null,
        updatedAt: serverTimestamp(),
      });

      setTransactionId(txnId);
      alert(t("pay.confirmation.success"));
    } catch (err) {
      console.error(err);
      alert(t("pay.confirmation.failed"));
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
            {t("pay.title")}
          </h1>
          <p className="text-text-secondary mt-2">
            {t("pay.instructions.part1")} <Money amount={AMOUNT_LAK} />{" "}
            {t("pay.instructions.part2")}
          </p>
        </div>
      </section>

      {/* Payment Card */}
      <section className="py-10 sm:py-14">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-md">
            {/* QR */}
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-2xl border bg-gray-50">
                <Image
                  src="/images/assets/QR.jpeg"
                  alt="QR Code"
                  width={240}
                  height={240}
                  className="rounded-xl"
                  priority
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary font-medium">
                  {t("pay.plan")}
                </span>
                <span className="text-text-primary">
                  <Money amount={AMOUNT_LAK} />
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-text-primary font-semibold">
                  {t("pay.total")}
                </span>
                <span className="text-2xl font-bold text-primary">
                  <Money amount={AMOUNT_LAK} />
                </span>
              </div>
            </div>

            {/* Transaction Info */}
            {transactionId && (
              <div className="mt-6 p-3 border border-dashed border-primary/40 rounded-lg bg-primary/5 text-center">
                <p className="text-sm font-semibold text-text-primary">
                  {t("pay.transaction.idLabel")}
                </p>
                <p className="font-mono text-primary mt-1 text-base">
                  {transactionId}
                </p>
                <p className="text-xs text-text-secondary mt-2">
                  {t("pay.transaction.note")}
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
                {isSubmitting ? "Processing..." : t("pay.buttons.paid")}
              </button>

              <Link
                href="/contact"
                className="text-sm underline text-text-secondary"
              >
                {t("pay.buttons.contact")}
              </Link>
            </div>

            {/* Tip */}
            <p className="text-[11px] text-text-secondary mt-4 text-center">
              {t("pay.tip.text")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
