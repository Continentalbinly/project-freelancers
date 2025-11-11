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
import Link from "next/link";
import {
  getProjectStatusLabel,
  projectStatusLabels,
} from "../utils/statusUtils";

export default function ChatRoomPage() {
  const { id } = useParams(); // chat room id
  const router = useRouter();
  const { user } = useAuth();
  const { t, currentLanguage } = useTranslationContext();

  const [chatRoom, setChatRoom] = useState<any>(null);
  const [receiver, setReceiver] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  /** ------------------- 🔹 LOAD CHAT ROOM + MESSAGES ------------------- */
  useEffect(() => {
    if (!id || !user) return;

    // Chat room data
    const unsubRoom = onSnapshot(doc(db, "chatRooms", id as string), (snap) => {
      if (snap.exists()) setChatRoom({ id: snap.id, ...snap.data() });
    });

    // Chat messages
    const q = query(
      collection(db, "chatMessages"),
      where("chatRoomId", "==", id),
      orderBy("timestamp", "asc")
    );
    const unsubMessages = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubRoom();
      unsubMessages();
    };
  }, [id, user]);

  /** ------------------- 🔹 LOAD RECEIVER PROFILE ------------------- */
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

  /** ------------------- 🔹 AUTO SCROLL TO BOTTOM ------------------- */
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ------------------- 🔹 TRACK PROJECT STATUS LIVE ------------------- */
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
      console.error("Error sending message:", err);
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

  /** ------------------- 🔹 NO CHAT ROOM YET ------------------- */
  if (!chatRoom)
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        {t("common.loading") || "Loading..."}
      </div>
    );

  /** ------------------- 💬 MAIN CHAT UI ------------------- */
  return (
    <main className="flex flex-col h-screen bg-background-secondary">
      {/* 🔹 Header */}
      <div className="lg:hidden sticky top-0 z-20 flex flex-col border-b border-border bg-white shadow-sm">
        <div className="flex items-center gap-3 h-16 px-4">
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
          <div className="flex flex-col truncate">
            <span className="font-semibold text-text-primary truncate">
              {receiver?.fullName || "User"}
            </span>
            <span className="text-xs text-text-secondary truncate">
              {chatRoom?.projectTitle || "Direct Chat"}
            </span>
          </div>
        </div>

        {/* 🟢 Status bar under header */}
        {chatRoom?.projectId && (
          <div className="flex items-center justify-between px-4 py-2 bg-background-secondary border-t border-border">
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}
            >
              {statusLabel}
            </span>

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

      {/* 🔹 Input or Disabled Notice */}
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
