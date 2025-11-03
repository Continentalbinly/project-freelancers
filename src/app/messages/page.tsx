"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeftIcon } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();

  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [profileCache, setProfileCache] = useState<
    Record<string, { fullName: string; avatarUrl: string }>
  >({});
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const projectId = params.get("project");

  // Load chat rooms
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

  // Auto-open if project param exists
  useEffect(() => {
    if (!user || !projectId) return;
    (async () => {
      const room = await createOrOpenChatRoom(projectId, user.uid);
      if (room) setSelectedRoom(room);
    })();
  }, [user, projectId]);

  // Fetch profile cache
  useEffect(() => {
    if (!user) return;
    const missing: string[] = [];
    chatRooms.forEach((r) => {
      const other = r.participants?.find((id: string) => id !== user.uid);
      if (other && !profileCache[other]) missing.push(other);
    });

    missing.forEach(async (uid) => {
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        const d = snap.data();
        setProfileCache((p) => ({
          ...p,
          [uid]: {
            fullName: d.fullName || "Unknown",
            avatarUrl: d.avatarUrl || "",
          },
        }));
      }
    });
  }, [chatRooms, user, profileCache]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        {t("common.loading") || "Loading..."}
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* 🔹 Custom Header for /messages page (mobile only) */}
      <div className="lg:hidden sticky top-0 z-20 h-16 flex items-center justify-between px-4 border-b border-border bg-white shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-background-secondary transition"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <h2 className="text-base font-semibold text-text-primary">
          {t("dashboard.messagesPage.title")}
        </h2>
        <div className="w-5" /> {/* Placeholder for alignment */}
      </div>
      <ChatList
        chatRooms={chatRooms}
        loading={loading}
        profileCache={profileCache}
        selectedRoom={selectedRoom}
        onSelect={(room: any) => {
          if (window.innerWidth < 1024) {
            // 📱 Mobile → go to dedicated page
            router.push(`/messages/${room.id}`);
          } else {
            // 💻 Desktop → open inline
            setSelectedRoom(room);
          }
        }}
      />
      <ChatRoom chatRoom={selectedRoom} onBack={() => setSelectedRoom(null)} />
    </div>
  );
}
