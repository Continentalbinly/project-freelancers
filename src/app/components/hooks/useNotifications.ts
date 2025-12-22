"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc, writeBatch, getDocsFromCache, getDocs } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Notification } from "@/types/notification";

interface UseNotificationsOptions {
  userId: string | null;
  limitCount?: number;
}

export function useNotifications({ userId, limitCount = 50 }: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(requireDb(), "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    // ✅ Cache-first: Try cache first for instant load
    const loadFromCache = async () => {
      try {
        const cacheSnap = await getDocsFromCache(q);
        if (!cacheSnap.empty) {
          const notifs: Notification[] = [];
          let unread = 0;

          cacheSnap.docs.forEach((doc) => {
            const data = doc.data();
            const notif = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            } as Notification;

            notifs.push(notif);
            if (!notif.read) {
              unread++;
            }
          });

          setNotifications(notifs);
          setUnreadCount(unread);
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
        const notifs: Notification[] = [];
        let unread = 0;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const notif = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Notification;

          notifs.push(notif);
          if (!notif.read) {
            unread++;
          }
        });

        setNotifications(notifs);
        setUnreadCount(unread);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    try {
      await updateDoc(doc(requireDb(), "notifications", notificationId), {
        read: true,
      });
    } catch {
    }
  };

  const markAllAsRead = async () => {
    if (!userId || notifications.length === 0) return;
    try {
      const batch = writeBatch(requireDb());
      const unreadNotifications = notifications.filter((n) => !n.read);
      
      unreadNotifications.forEach((notif) => {
        const ref = doc(requireDb(), "notifications", notif.id);
        batch.update(ref, { read: true });
      });

      await batch.commit();
    } catch {
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}

