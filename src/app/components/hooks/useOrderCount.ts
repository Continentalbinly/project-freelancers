"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocsFromCache } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Order } from "@/types/order";

interface UseOrderCountOptions {
  userId: string | null;
  userRole: "client" | "freelancer" | null;
}

export function useOrderCount({ userId, userRole }: UseOrderCountOptions) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !userRole) {
      setCount(0);
      setLoading(false);
      return;
    }

    // Determine which field to query based on role
    const field = userRole === "freelancer" ? "sellerId" : "buyerId";

    // Query orders that need attention
    // For both roles: pending, in_progress, delivered, and orders with revisionPending
    const q = query(
      collection(requireDb(), "orders"),
      where(field, "==", userId)
    );

    // ✅ Cache-first: Try cache first for instant load
    const loadFromCache = async () => {
      try {
        const cacheSnap = await getDocsFromCache(q);
        if (!cacheSnap.empty) {
          let attentionCount = 0;

          cacheSnap.docs.forEach((doc) => {
            const order = { id: doc.id, ...doc.data() } as Order;

            if (
              order.status !== "completed" &&
              order.status !== "cancelled" &&
              order.status !== "refunded" &&
              (
                order.status === "pending" ||
                order.status === "accepted" ||
                order.status === "in_progress" ||
                order.status === "delivered" ||
                order.status === "awaiting_payment" ||
                order.revisionPending === true
              )
            ) {
              attentionCount++;
            }
          });

          setCount(attentionCount);
          setLoading(false);
        }
      } catch (cacheError) {
        // Cache miss, will load from server via onSnapshot
      }
    };

    // Load from cache first
    loadFromCache();

    // Then set up real-time listener for updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let attentionCount = 0;

        snapshot.docs.forEach((doc) => {
          const order = { id: doc.id, ...doc.data() } as Order;

          // Count orders that need attention (exclude completed, cancelled, refunded)
          if (
            order.status !== "completed" &&
            order.status !== "cancelled" &&
            order.status !== "refunded" &&
            (
              order.status === "pending" || // Waiting for acceptance
              order.status === "accepted" || // Accepted but not started
              order.status === "in_progress" || // Active work
              order.status === "delivered" || // Waiting for review/payment
              order.status === "awaiting_payment" || // Waiting for payment
              order.revisionPending === true // Revision requested
            )
          ) {
            attentionCount++;
          }
        });

        setCount(attentionCount);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching order count:", error);
        setCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, userRole]);

  return { count, loading };
}

