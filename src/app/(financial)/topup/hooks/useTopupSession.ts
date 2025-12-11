"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";

export function useTopupSession(userId?: string) {
  const [session, setSession] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "topupSessions", userId);
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

        setSession(data);
      });

      setInitialized(true);
    };

    init();
    return () => unsub();
  }, [userId]);

  const updateSession = async (data: any) => {
    if (!userId) return;
    const ref = doc(db, "topupSessions", userId);
    await setDoc(ref, data, { merge: true });
  };

  return { session, updateSession, initialized };
}
