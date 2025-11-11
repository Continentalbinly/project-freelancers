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
import Link from "next/link";
import {
  getProjectStatusLabel,
  projectStatusLabels,
} from "../utils/statusUtils";

export default function ChatRoom({ chatRoom, onBack }: any) {
  const { user } = useAuth();
  const { currentLanguage, t } = useTranslationContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [receiver, setReceiver] = useState<any>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  /** ------------------- 🔹 LOAD MESSAGES ------------------- */
  useEffect(() => {
    if (!chatRoom?.id) return;
    const q = query(
      collection(db, "chatMessages"),
      where("chatRoomId", "==", chatRoom.id),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [chatRoom?.id]);

  /** ------------------- 🔹 LOAD RECEIVER PROFILE ------------------- */
  useEffect(() => {
    if (!chatRoom || !user) return;
    const receiverId = chatRoom.participants?.find(
      (id: string) => id !== user.uid
    );
    if (!receiverId) return;
    getDoc(doc(db, "profiles", receiverId)).then((snap) => {
      if (snap.exists()) setReceiver(snap.data());
    });
  }, [chatRoom, user]);

  /** ------------------- 🔹 AUTO SCROLL ------------------- */
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ------------------- 🔹 TRACK PROJECT STATUS ------------------- */
  useEffect(() => {
    if (!chatRoom?.projectId) return;
    const unsub = onSnapshot(
      doc(db, "projects", chatRoom.projectId),
      (snap) => {
        if (snap.exists()) setProjectStatus(snap.data().status);
      }
    );
    return () => unsub();
  }, [chatRoom?.projectId]);

  /** ------------------- 🔹 SEND MESSAGE ------------------- */
  const handleSend = async (text: string) => {
    if (!user || !chatRoom || projectStatus === "completed") return;
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
      console.error("❌ Error sending message:", err);
    }
  };

  /** ------------------- 🔹 STATUS UTILS ------------------- */
  const statusLabel = getProjectStatusLabel(
    projectStatus || "open",
    currentLanguage as "en" | "lo"
  );
  const statusColor =
    projectStatusLabels[projectStatus || "open"]?.color ||
    "bg-gray-100 text-gray-600";

  /** ------------------- 🔹 AUTH CHECK ------------------- */
  if (!user)
    return (
      <main className="flex-1 flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <p>{t("dashboard.messagesPage.signInFirst")}</p>
        </div>
      </main>
    );

  /** ------------------- 🔹 CHAT NOT SELECTED ------------------- */
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

  /** ------------------- 💬 MAIN CHAT UI ------------------- */
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
            {chatRoom?.projectTitle || "Direct Chat"}
          </span>
        </div>
      </div>

      {/* 🟢 Project status bar */}
      {chatRoom?.projectId && (
        <div className="bg-background-secondary border-b border-border px-4 py-2 flex items-center justify-between">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}
          >
            {statusLabel}
          </span>

          {/* Go to progress button */}
          {projectStatus !== "completed" && (
            <Link
              href={`/my-projects/${chatRoom.projectId}/progress`}
              className="text-xs font-medium text-primary hover:underline"
            >
              {currentLanguage === "lo" ? "ເບິ່ງຄວາມຄືບໜ້າ" : "View Progress"}
            </Link>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-background-secondary px-4 py-4">
        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
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

      {/* Input / Disabled */}
      {projectStatus === "completed" ? (
        <div className="text-center py-3 text-sm text-gray-500 border-t border-border bg-white">
          {currentLanguage === "lo"
            ? "ໂຄງການນີ້ສຳເລັດແລ້ວ — ບໍ່ສາມາດສົ່ງຂໍ້ຄວາມໄດ້."
            : "This project is completed — messaging is disabled."}
        </div>
      ) : (
        <MessageInput
          onSend={handleSend}
          placeholder={t("dashboard.messagesPage.typeMessage")}
        />
      )}
    </main>
  );
}
