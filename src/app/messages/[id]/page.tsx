"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { db } from "@/service/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import Avatar from "@/app/utils/avatarHandler";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import MessageInput from "../components/MessageInput";

export default function ChatRoomPage() {
  const { id } = useParams(); // chat room id
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [receiver, setReceiver] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Load chat room
    const unsubRoom = onSnapshot(doc(db, "chatRooms", id as string), (snap) => {
      if (snap.exists()) setChatRoom({ id: snap.id, ...snap.data() });
    });

    // Load messages
    const q = query(
      collection(db, "chatMessages"),
      where("chatRoomId", "==", id),
      orderBy("timestamp", "asc")
    );
    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubRoom();
      unsubMessages();
    };
  }, [id, user]);

  useEffect(() => {
    if (!chatRoom || !user) return;
    const receiverId = chatRoom.participants?.find(
      (x: string) => x !== user.uid
    );
    if (!receiverId) return;

    getDoc(doc(db, "profiles", receiverId)).then((snap) => {
      if (snap.exists()) setReceiver(snap.data());
    });
  }, [chatRoom, user]);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!user || !chatRoom) return;
    try {
      await addDoc(collection(db, "chatMessages"), {
        chatRoomId: chatRoom.id,
        message: text,
        senderId: user.uid,
        receiverId: chatRoom.participants.find((id: string) => id !== user.uid),
        timestamp: serverTimestamp(),
      });
      await updateDoc(doc(db, "chatRooms", chatRoom.id), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatRoom)
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        {t("common.loading") || "Loading..."}
      </div>
    );

  return (
    <main className="flex flex-col h-screen bg-background-secondary">
      {/* 🔹 Mobile Chat Header */}
      <div className="lg:hidden sticky top-0 z-20 h-16 flex items-center gap-3 border-b border-border bg-white px-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-background-secondary"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <Avatar
          src={receiver?.avatarUrl || ""}
          name={receiver?.fullName || "User"}
          size="lg"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary truncate">
            {receiver?.fullName || "User"}
          </span>
          <span className="text-xs text-text-secondary truncate">
            {chatRoom.projectTitle || "Direct Chat"}
          </span>
        </div>
      </div>

      {/* 🔹 Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}
            >
              {!isMe && (
                <Avatar
                  src={receiver?.avatarUrl || ""}
                  name={receiver?.fullName || "U"}
                  size="sm"
                />
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                  isMe
                    ? "bg-primary text-white"
                    : "bg-white text-text-primary border border-border"
                }`}
              >
                <p className="text-sm break-words">{m.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* 🔹 Input */}
      <MessageInput
        onSend={handleSend}
        placeholder={t("dashboard.messagesPage.typeMessage")}
      />
    </main>
  );
}
