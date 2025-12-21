"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  FileText,
  XCircle,
} from "lucide-react";
import { useNotifications } from "@/app/components/hooks/useNotifications";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { convertTimestampToDate } from "@/service/timeUtils";
import {
  translateNotificationTitle,
  translateNotificationMessage,
} from "@/app/components/utils/notificationTranslator";

export default function NotificationsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { t } = useTranslationContext();
  const userRole =
    profile?.role === "client"
      ? "client"
      : profile?.role === "freelancer"
      ? "freelancer"
      : null;
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications({
      userId: user?.uid || null,
      limitCount: 50,
    });

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

  const handleNotificationClick = async (
    notificationId: string,
    orderId?: string,
    projectId?: string,
    notificationType?: string,
    proposalId?: string
  ) => {
    await markAsRead(notificationId);
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
    // If no specific link, stay on notifications page
  };

  return (
    <div className="w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col pt-4 pb-4 sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
          {" "}
          {t("header.notifications") || "Notifications"}
        </h1>
        {!loading && unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-bold text-white bg-error rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {!loading && unreadCount > 0 && notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm sm:text-base text-primary hover:underline font-medium"
          >
            {t("notifications.markAllRead") || "Mark all as read"}
          </button>
        )}
      </div>
      {/* Notifications List */}
      <div className="w-full">
        {loading ? (
          <div className="space-y-2 sm:space-y-3 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="animate-pulse w-full p-3 sm:p-4 md:p-5 rounded-lg border border-border dark:border-gray-700 bg-background-secondary dark:bg-gray-800/50"
              >
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  {/* Icon skeleton */}
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
                  </div>
                  {/* Content skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Title skeleton */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-4 sm:h-5 md:h-6 bg-background-tertiary dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
                    </div>
                    {/* Message skeleton */}
                    <div className="space-y-1.5">
                      <div className="h-3 sm:h-4 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-3 sm:h-4 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                    {/* Time skeleton */}
                    <div className="h-2 sm:h-3 bg-background-tertiary dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 text-center w-full">
            <Bell className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-text-secondary/50 mb-3 sm:mb-4" />
            <p className="text-text-secondary text-base sm:text-lg md:text-xl font-medium mb-2">
              {t("notifications.empty") || "No notifications"}
            </p>
            <p className="text-text-secondary/70 text-sm sm:text-base max-w-md mx-auto px-4">
              {t("notifications.emptyDescription") ||
                "You'll see notifications here when there are updates on your orders"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 w-full">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleNotificationClick(
                    notif.id,
                    notif.orderId,
                    notif.projectId,
                    notif.type,
                    notif.proposalId
                  );
                }}
                className={`block w-full p-3 sm:p-4 md:p-5 rounded-lg border transition-colors cursor-pointer ${
                  !notif.read
                    ? "bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30"
                    : "bg-background-secondary dark:bg-gray-800/50 border-border dark:border-gray-700 hover:bg-background-tertiary dark:hover:bg-gray-800"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNotificationClick(
                      notif.id,
                      notif.orderId,
                      notif.projectId,
                      notif.type
                    );
                  }
                }}
              >
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 sm:w-6 sm:h-6">
                      {getNotificationIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1 sm:mb-1.5">
                      <p className="font-semibold text-text-primary text-sm sm:text-base md:text-lg leading-tight">
                        {translateNotificationTitle(notif.type, notif.title, t)}
                      </p>
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full mt-1.5 sm:mt-2"></div>
                      )}
                    </div>
                    <p className="text-text-secondary text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {translateNotificationMessage(
                        notif.type,
                        notif.message,
                        notif.orderStatus,
                        userRole,
                        t
                      )}
                    </p>
                    <p className="text-text-secondary/70 text-[10px] sm:text-xs md:text-sm mt-1">
                      {formatTime(
                        convertTimestampToDate(notif.createdAt as any)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
