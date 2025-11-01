"use client";

import { useEffect, useRef, useState } from "react";
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
import MessageInput from "./MessageInput";

export default function ChatRoom({ chatRoom, onBack }: any) {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [receiver, setReceiver] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 🔹 Auth safety guard
  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <p>
            {t("dashboard.messagesPage.signInFirst") ||
              "Please sign in to use chat."}
          </p>
        </div>
      </main>
    );
  }

  // 🔹 Load messages
  useEffect(() => {
    if (!chatRoom) return;
    const q = query(
      collection(db, "chatMessages"),
      where("chatRoomId", "==", chatRoom.id),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [chatRoom]);

  // 🔹 Load receiver info
  useEffect(() => {
    if (!chatRoom || !user) return;
    const receiverId = chatRoom.participants?.find(
      (id: string) => id !== user?.uid
    );
    if (!receiverId) return;
    getDoc(doc(db, "profiles", receiverId)).then((snap) => {
      if (snap.exists()) setReceiver(snap.data());
    });
  }, [chatRoom, user]);

  // 🔹 Auto scroll
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Send message
  const handleSend = async (text: string) => {
    if (!user || !chatRoom) return;
    try {
      await addDoc(collection(db, "chatMessages"), {
        chatRoomId: chatRoom.id,
        message: text,
        senderId: user?.uid,
        receiverId: chatRoom.participants.find(
          (id: string) => id !== user?.uid
        ),
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
      <main className="flex-1 flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1">
            {t("dashboard.messagesPage.selectConversation")}
          </h3>
          <p className="text-sm">
            {t("dashboard.messagesPage.selectConversationDesc")}
          </p>
        </div>
      </main>
    );

  return (
    <main className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <button
          onClick={onBack}
          className="lg:hidden p-2 rounded-full hover:bg-background-secondary"
        >
          <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <Avatar
          src={receiver?.avatarUrl || ""}
          name={receiver?.fullName || "User"}
          size="lg"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">
            {receiver?.fullName || "User"}
          </span>
          <span className="text-xs text-text-secondary">
            {chatRoom.projectTitle || "Direct Chat"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-background-secondary px-4 py-4">
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
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${
                  isMe
                    ? "bg-primary text-white"
                    : "bg-white text-text-primary border border-border"
                }`}
              >
                <p className="text-sm">{m.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* ✅ Message Input Component */}
      <MessageInput
        onSend={handleSend}
        placeholder={t("dashboard.messagesPage.typeMessage")}
      />
    </main>
  );
}
