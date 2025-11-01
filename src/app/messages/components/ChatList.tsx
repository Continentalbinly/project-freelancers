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

  const filteredRooms = chatRooms.filter((r: any) => {
    const otherId = r.participants?.find((id: string) => id !== user?.uid);
    const name = profileCache[otherId]?.fullName?.toLowerCase() || "";
    const title = r.projectTitle?.toLowerCase() || "";
    return (
      !search ||
      name.includes(search.toLowerCase()) ||
      title.includes(search.toLowerCase())
    );
  });

  return (
    <aside
      className={`w-full lg:w-80 border-r border-border bg-gradient-to-b from-white to-background-secondary flex flex-col overflow-hidden ${
        selectedRoom ? "hidden lg:flex" : "flex"
      }`}
    >
      {/* === Header === */}
      <div className="p-4 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="font-bold text-lg sm:text-xl text-text-primary mb-3">
          {t("dashboard.messagesPage.title")}
        </h1>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder={t("dashboard.messagesPage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* === Chat List === */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary py-16">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary mb-3 rounded-full" />
            <p>{t("dashboard.messagesPage.loadingConversations")}</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-text-secondary py-20 px-6 text-center">
            <ChatBubbleOvalLeftEllipsisIcon className="w-10 h-10 text-text-muted mb-3" />
            <p className="font-medium">
              {t("dashboard.messagesPage.noConversations")}
            </p>
            <p className="text-sm text-text-muted mt-1">
              {t("dashboard.messagesPage.noConversationsHint") ||
                "Start chatting by accepting a project!"}
            </p>
          </div>
        ) : (
          filteredRooms.map((room: any) => {
            const otherId = room.participants?.find(
              (id: string) => id !== user?.uid
            );
            const name = profileCache[otherId]?.fullName || "Unknown User";
            const avatar = profileCache[otherId]?.avatarUrl || "";

            const lastMessage =
              room.lastMessage?.length > 40
                ? room.lastMessage.slice(0, 40) + "..."
                : room.lastMessage || "No messages yet.";

            const timeLabel = room.lastMessageTime
              ? new Date(
                  room.lastMessageTime.seconds * 1000
                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";

            const isActive = selectedRoom?.id === room.id;

            return (
              <div
                key={room.id}
                onClick={() => onSelect(room)}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150
                ${
                  isActive
                    ? "bg-primary/10 border-l-4 border-primary shadow-sm"
                    : "hover:bg-background-secondary border-l-4 border-transparent"
                }`}
              >
                <Avatar src={avatar} name={name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                      {name}
                    </p>
                    <span className="text-[11px] text-text-muted ml-2">
                      {timeLabel}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary truncate">
                    {lastMessage}
                  </p>

                  {room.projectTitle && (
                    <p className="text-[11px] text-primary font-medium mt-1 truncate">
                      {room.projectTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtle shadow overlay at bottom */}
      <div className="h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </aside>
  );
}
