"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { TopupSession, UpdateSessionFunction } from "@/types/topup";

export function useTopupSession(userId?: string) {
  const [session, setSession] = useState<TopupSession | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const firestore = requireDb();

    const ref = doc(firestore, "topupSessions", userId);
    let unsub = () => {};

    const init = async () => {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          userId,
          step: "select",
          qrCode: null,
          transactionId: null,
          expiresAt: null,
          createdAt: serverTimestamp(),
        });
      }

      unsub = onSnapshot(ref, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        // ⚠️ Auto-expire after 3 minutes
        if (
          data.step === "qr" &&
          data.expiresAt &&
          Date.now() > data.expiresAt
        ) {
          setDoc(
            ref,
            { step: "expired", expiredAt: Date.now() },
            { merge: true }
          );
        }

        setSession(data as TopupSession);
      });

      setInitialized(true);
    };

    init();
    return () => unsub();
  }, [userId]);

  const updateSession: UpdateSessionFunction = async (data) => {
    if (!userId) return;
    const firestore = requireDb();
    const ref = doc(firestore, "topupSessions", userId);
    await setDoc(ref, data, { merge: true });
  };

  return { session, updateSession, initialized };
}
