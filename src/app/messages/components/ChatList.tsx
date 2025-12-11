"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import Avatar from "@/app/utils/avatarHandler";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";

export default function ChatList({
  chatRooms,
  loading,
  profileCache,
  selectedRoom,
  onSelect,
}: any) {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [search, setSearch] = useState("");

  const filtered = chatRooms.filter((r: any) => {
    const other = r.participants?.find((id: string) => id !== user?.uid);
    const name = profileCache[other]?.fullName?.toLowerCase() || "";
    const title = r.projectTitle?.toLowerCase() || "";
    return (
      !search ||
      name.includes(search.toLowerCase()) ||
      title.includes(search.toLowerCase())
    );
  });

  return (
    <aside
      className={`w-full lg:w-80 flex flex-col border-r border-border bg-background ${
        selectedRoom ? "hidden lg:flex" : "flex"
      }`}
    >
      {/* === Header === */}
      <div className="h-16 flex items-center px-4 border-b border-border bg-background sticky top-0 z-10 shadow-sm">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder={t("dashboard.messagesPage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-border bg-background-secondary text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* === Chat List === */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-background">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background shadow-sm"
              >
                <div className="h-12 w-12 rounded-full-tertiary flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-4 w-32 bg-background-tertiary rounded" />
                  <div className="h-3 w-44 bg-background-tertiary rounded" />
                  <div className="h-3 w-24 bg-background-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-text-secondary py-20 px-6 text-center">
            <ChatBubbleOvalLeftEllipsisIcon className="w-10 h-10 text-text-secondary mb-3" />
            <p className="font-medium">
              {t("dashboard.messagesPage.noConversations")}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {t("dashboard.messagesPage.noConversationsHint") ||
                "Start chatting by accepting a project!"}
            </p>
          </div>
        ) : (
          filtered.map((room: any) => {
            const otherId = room.participants?.find(
              (id: string) => id !== user?.uid
            );
            const name = profileCache[otherId]?.fullName || "Unknown";
            const avatar = profileCache[otherId]?.avatarUrl || "";

            const last = room.lastMessage
              ? room.lastMessage.length > 40
                ? room.lastMessage.slice(0, 40) + "..."
                : room.lastMessage
              : "No messages yet";

            const timeLabel = room.lastMessageTime
              ? new Date(
                  room.lastMessageTime.seconds * 1000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            const isActive = selectedRoom?.id === room.id;

            return (
              <div
                key={room.id}
                onClick={() => onSelect(room)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg border bg-background transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 border-primary shadow-md"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <Avatar src={avatar} name={name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold truncate transition-colors duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-text-primary group-hover:text-primary"
                    }`}>
                      {name}
                    </p>
                    <span className="text-[11px] text-text-secondary whitespace-nowrap flex-shrink-0">
                      {timeLabel}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary truncate group-hover:text-text-primary/80 transition-colors duration-200">{last}</p>

                  {room.projectTitle && (
                    <p className="text-[11px] text-primary font-medium mt-1 truncate">
                      📌 {room.projectTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* === Floating button for mobile (optional) === */}
      <div className="lg:hidden fixed bottom-20 right-4">
        <button className="bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
}
