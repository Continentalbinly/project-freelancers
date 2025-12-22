"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { requireDb } from "@/service/firebase";
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
import ChatRoomComponent from "./components/ChatRoom";
import { createOrOpenChatRoom, createOrOpenChatRoomForOrder } from "@/app/utils/chatUtils";
import type { ChatRoom } from "@/types/chat";
import { ArrowLeftIcon } from "lucide-react";
import MessagesSkeleton from "./components/MessagesSkeleton";

function MessagesPageContent() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const router = useRouter();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [profileCache, setProfileCache] = useState<
    Record<string, { fullName: string; avatarUrl: string }>
  >({});
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const projectId = params.get("project");
  const orderId = params.get("order");

  // Load chat rooms
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const firestore = requireDb();

    const q = query(
      collection(firestore, "chatRooms"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setChatRooms(snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          participants: data.participants || [],
          projectId: data.projectId,
          orderId: data.orderId,
          projectTitle: data.projectTitle,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          unreadCount: data.unreadCount,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as ChatRoom;
      }));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Auto-open if project param exists
  useEffect(() => {
    if (!user) return;
    if (projectId) {
      (async () => {
        const room = await createOrOpenChatRoom(projectId, user.uid);
        if (room && 'participants' in room && Array.isArray(room.participants)) {
          setSelectedRoom(room as ChatRoom);
        }
      })();
      return;
    }
    if (orderId) {
      (async () => {
        const room = await createOrOpenChatRoomForOrder(orderId, user.uid);
        if (room && 'participants' in room && Array.isArray(room.participants)) {
          setSelectedRoom(room as ChatRoom);
        }
      })();
    }
  }, [user, projectId, orderId]);

  // Fetch profile cache
  useEffect(() => {
    if (!user) return;
    const missing: string[] = [];
    chatRooms.forEach((r) => {
      const other = r.participants?.find((id: string) => id !== user.uid);
      if (other && !profileCache[other]) missing.push(other);
    });

    missing.forEach(async (uid) => {
      const firestore = requireDb();
      const snap = await getDoc(doc(firestore, "profiles", uid));
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

  if (loading) return <MessagesSkeleton />;

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* 🔹 Custom Header for /messages page (mobile only) */}
      <div className="lg:hidden sticky top-0 z-20 h-16 flex items-center justify-between px-4 border-b border-border bg-background shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-background-secondary transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold">
          {t("dashboard.messagesPage.title")}
        </h2>
        <div className="w-5" /> {/* Placeholder for alignment */}
      </div>
      <ChatList
        chatRooms={chatRooms}
        loading={loading}
        profileCache={profileCache}
        selectedRoom={selectedRoom}
        onSelect={(room: ChatRoom) => {
          if (window.innerWidth < 1024) {
            // 📱 Mobile → go to dedicated page
            router.push(`/messages/${room.id}`);
          } else {
            // 💻 Desktop → open inline
            setSelectedRoom(room);
          }
        }}
      />
      <ChatRoomComponent chatRoom={selectedRoom} onBack={() => setSelectedRoom(null)} />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesPageContent />
    </Suspense>
  );
}