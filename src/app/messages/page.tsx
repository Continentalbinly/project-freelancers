"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { db } from "@/service/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";

import ChatList from "./components/ChatList";
import ChatRoom from "./components/ChatRoom";
import { createOrOpenChatRoom } from "@/app/utils/chatUtils";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [profileCache, setProfileCache] = useState<
    Record<string, { fullName: string; avatarUrl: string }>
  >({});
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const projectId = params.get("project");

  // 🔹 Load all chat rooms for the user
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(
      collection(db, "chatRooms"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setChatRooms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // 🔹 Auto-open chat room when `?project=` param exists
  useEffect(() => {
    if (!user || !projectId) return;

    (async () => {
      const room = await createOrOpenChatRoom(projectId, user.uid);
      if (room) setSelectedRoom(room);
    })();
  }, [user, projectId]);

  // 🔹 Fetch missing profile data
  useEffect(() => {
    if (!user) return;
    const missingIds: string[] = [];
    chatRooms.forEach((room) => {
      const otherId = room.participants?.find((id: string) => id !== user.uid);
      if (otherId && !profileCache[otherId]) missingIds.push(otherId);
    });

    missingIds.forEach(async (uid) => {
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfileCache((prev) => ({
          ...prev,
          [uid]: {
            fullName: data.fullName || "Unknown User",
            avatarUrl: data.avatarUrl || "",
          },
        }));
      }
    });
  }, [chatRooms, user, profileCache]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Please sign in to view your messages.
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      <ChatList
        chatRooms={chatRooms}
        loading={loading}
        profileCache={profileCache}
        selectedRoom={selectedRoom}
        onSelect={setSelectedRoom}
      />
      <ChatRoom chatRoom={selectedRoom} onBack={() => setSelectedRoom(null)} />
    </div>
  );
}
