"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, Check, Package, AlertCircle, CheckCircle, Clock, DollarSign, ShoppingCart, FileText, XCircle } from "lucide-react";
import { useNotifications } from "./hooks/useNotifications";
import { useTranslationContext } from "./LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { convertTimestampToDate } from "@/service/timeUtils";
import { translateNotificationTitle, translateNotificationMessage } from "./utils/notificationTranslator";

interface NotificationsDropdownProps {
  userId: string | null;
}

export default function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const { t } = useTranslationContext();
  const { profile } = useAuth();
  const router = useRouter();
  const userRole = profile?.role === "client" ? "client" : profile?.role === "freelancer" ? "freelancer" : null;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications({
    userId,
    limitCount: 20,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notificationId: string, orderId?: string, projectId?: string, notificationType?: string, proposalId?: string) => {
    await markAsRead(notificationId);
    setIsOpen(false);
    if (orderId) {
      router.push(`/orders/${orderId}`);
    } else if (proposalId) {
      // Navigate to specific proposal if available
      router.push(`/proposals/${proposalId}`);
    } else if (notificationType && (notificationType === "proposal_submitted" || notificationType === "proposal_accepted" || notificationType === "proposal_rejected")) {
      // For proposal notifications, navigate to proposals page
      router.push("/proposals");
    } else if (projectId) {
      router.push(`/projects/${projectId}`);
    }
    // For topup notifications, just stay on notifications page (no redirect needed)
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_status_changed":
      case "order_accepted":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "order_delivered":
        return <Package className="w-5 h-5 text-green-500" />;
      case "order_revision_requested":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "order_revision_accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "order_revision_declined":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case "order_completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "order_payment_received":
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "order_created":
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case "topup_completed":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case "proposal_submitted":
        return <FileText className="w-5 h-5 text-purple-500" />;
      case "proposal_accepted":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "proposal_rejected":
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${t("common.timeDays") || "d"} ago`;
    if (hours > 0) return `${hours}${t("common.timeHours") || "h"} ago`;
    if (minutes > 0) return `${minutes}${t("common.timeMinutes") || "m"} ago`;
    return t("common.timeJustNow") || "Just now";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title={t("header.notifications") || "Notifications"}
      >
        <Bell className="w-5 h-5 text-text-primary hover:text-primary dark:hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-gray-700">
            <h3 className="font-semibold text-text-primary">
              {t("header.notifications") || "Notifications"}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                  title={t("notifications.markAllRead") || "Mark all as read"}
                >
                  {t("notifications.markAllRead") || "Mark all read"}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-background-secondary dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-background-secondary dark:bg-gray-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" />
                <p className="text-text-secondary text-sm">
                  {t("notifications.empty") || "No notifications"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border dark:divide-gray-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNotificationClick(notif.id, notif.orderId, notif.projectId, notif.type, notif.proposalId);
                    }}
                    className={`block p-4 hover:bg-background-secondary dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                      !notif.read ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotificationClick(notif.id, notif.orderId, notif.projectId, notif.type, notif.proposalId);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm mb-1">
                          {translateNotificationTitle(notif.type, notif.title, t)}
                        </p>
                        <p className="text-text-secondary text-xs line-clamp-2">
                          {translateNotificationMessage(notif.type, notif.message, notif.orderStatus, userRole, t)}
                        </p>
                        <p className="text-text-secondary/70 text-[10px] mt-1">
                          {formatTime(convertTimestampToDate(
                            typeof notif.createdAt === 'object' && 'toDate' in notif.createdAt
                              ? (notif.createdAt as any).toDate()
                              : notif.createdAt instanceof Date
                              ? notif.createdAt
                              : notif.createdAt
                          ))}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  router.push("/notifications");
                }}
                className="block w-full text-center text-sm text-primary hover:underline cursor-pointer"
              >
                {t("notifications.viewAll") || "View all notifications"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

