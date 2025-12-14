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
  const [loadingReceiver, setLoadingReceiver] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
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
    
    setLoadingReceiver(true);
    const receiverId = chatRoom.participants?.find(
      (x: string) => x !== user.uid
    );
    if (!receiverId) {
      setLoadingReceiver(false);
      return;
    }
    
    getDoc(doc(db, "profiles", receiverId)).then((snap) => {
      if (snap.exists()) setReceiver(snap.data());
      setLoadingReceiver(false);
    });
  }, [chatRoom, user]);

  /** ------------------- 🔹 AUTO SCROLL TO BOTTOM ------------------- */
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ------------------- 🔹 TRACK PROJECT/ORDER STATUS LIVE ------------------- */
  useEffect(() => {
    if (chatRoom?.projectId) {
      const unsub = onSnapshot(doc(db, "projects", chatRoom.projectId), (snap) => {
        if (snap.exists()) setProjectStatus(snap.data().status);
      });
      return () => unsub();
    }
    if (chatRoom?.orderId) {
      const unsub = onSnapshot(doc(db, "orders", chatRoom.orderId), (snap) => {
        if (snap.exists()) setOrderStatus(snap.data().status);
      });
      return () => unsub();
    }
  }, [chatRoom?.projectId, chatRoom?.orderId]);

  /** ------------------- 🔹 SEND MESSAGE ------------------- */
  const handleSend = async (text: string) => {
    if (!user || !chatRoom) return;
    // Project: disable when pending OR completed
    if (projectStatus === "pending" || projectStatus === "completed") return;
    // Order: disable only when completed
    if (orderStatus === "completed") return;
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
      //console.error("Error sending message:", err);
    }
  };

  /** ------------------- 🔹 STATUS UTILS ------------------- */
  const statusLabel = getProjectStatusLabel(
    projectStatus || "open",
    currentLanguage as "en" | "lo"
  );
  const statusColor =
    projectStatusLabels[projectStatus || "open"]?.color ||
    "text-gray-600";

  /** ------------------- 🔹 NO CHAT ROOM YET ------------------- */
  if (!chatRoom)
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        {t("common.loading") || "Loading..."}
      </div>
    );

  /** ------------------- 💬 MAIN CHAT UI ------------------- */
  return (
    <main className="flex flex-col h-screen bg-background">
      {/* 🔹 Header */}
      <div className="lg:hidden sticky top-0 z-20 flex flex-col border-b border-border bg-background shadow-sm">
        <div className="flex items-center gap-3 h-16 px-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-background-secondary transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
          </button>
          {loadingReceiver ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
          ) : (
            <Avatar
              src={receiver?.avatarUrl || ""}
              name={receiver?.fullName || "User"}
              size="lg"
            />
          )}
          <div className="flex flex-col truncate">
            <span className="font-semibold   truncate">
              {receiver?.fullName || "User"}
            </span>
            <span className="text-xs text-text-secondary truncate">
              {chatRoom?.projectTitle || "Direct Chat"}
            </span>
          </div>
        </div>

        {/* 🟢 Status bar under header */}
        {chatRoom?.projectId && (
          <div className="flex flex-col gap-3 px-4 py-3 bg-background-secondary border-t border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-text-secondary font-medium">
                  {currentLanguage === "lo" ? "ສະຖານະໂຄງການ" : "Project Status"}
                </span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center w-fit mt-1 ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {projectStatus !== "completed" && (
              <Link
                href={`/my-projects/${chatRoom.projectId}/progress`}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-lg transition-all duration-200 justify-center active:scale-98"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {currentLanguage === "lo" ? "ເບິ່ງຄວາມຄືບໜ້າ" : "View Progress"}
              </Link>
            )}
          </div>
        )}

        {/* 🟢 Order status bar under header */}
        {chatRoom?.orderId && (
          <div className="flex items-center gap-3 px-4 py-3 bg-background-secondary border-t border-border shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary font-medium">
                {currentLanguage === "lo" ? "ສະຖານະຄຳສັ່ງ" : "Order Status"}
              </span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full inline-flex items-center w-fit mt-1 ${
                orderStatus === "completed"
                  ? "text-success"
                  : orderStatus === "delivered"
                  ? "text-green-600"
                  : orderStatus === "in_progress"
                  ? "text-purple-600"
                  : orderStatus === "accepted"
                  ? "text-blue-600"
                  : orderStatus === "pending"
                  ? "text-amber-600"
                  : "text-text-secondary"
              }`}>
                {(orderStatus || "pending").replace("_", " ")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-background-secondary">
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
                    : "bg-background border border-border"
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
      {(projectStatus === "pending" || projectStatus === "completed") || orderStatus === "completed" ? (
        <div className="text-center py-3 text-sm text-text-secondary border-t border-border bg-background-secondary">
          {currentLanguage === "lo"
            ? projectStatus === "pending" 
              ? "ໂຄງການຍັງລໍຖ້າການອະນຸມັດ — ການສົ່ງຂໍ້ຄວາມຖືກປິດ."
              : "ຄຳສັ່ງ/ໂຄງການນີ້ສຳເລັດແລ້ວ — ການສົ່ງຂໍ້ຄວາມຖືກປິດ."
            : projectStatus === "pending"
            ? "Project is pending approval — messaging is disabled."
            : "This order/project is completed — messaging is disabled."}
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
