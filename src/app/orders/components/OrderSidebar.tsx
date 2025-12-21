"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { convertTimestampToDate } from "@/service/timeUtils";
import { User, MessageSquare, Clock } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";

interface OrderSidebarProps {
  order: Order;
  userRole: "client" | "freelancer";
  statusConfig: Record<OrderStatus, { color: string; bgColor: string; label: string }>;
  loadingChat: boolean;
  onSendMessage: (e: React.MouseEvent) => Promise<void>;
}

export default function OrderSidebar({
  order,
  userRole,
  statusConfig,
  loadingChat,
  onSendMessage,
}: OrderSidebarProps) {
  const { t } = useTranslationContext();
  const config = statusConfig[order.status];

  return (
    <div className="space-y-6">
      {/* Party Info */}
      <div className="border border-border rounded-xl bg-background-secondary p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          {userRole === "freelancer"
            ? t("orderDetail.clientInformation") || "Client Information"
            : t("orderDetail.freelancerInformation") || "Freelancer Information"}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link
              href={
                userRole === "freelancer"
                  ? `/profile/${order.buyerId}`
                  : `/profile/${order.sellerId}`
              }
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-primary hover:bg-primary/5"
            >
              <User className="w-4 h-4" />
              {t("orderDetail.viewProfile") || "View Profile"}
            </Link>
            <button
              onClick={onSendMessage}
              disabled={loadingChat}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-primary hover:bg-primary/5 ${
                loadingChat ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {loadingChat ? t("common.loading") || "Loading..." : t("orderDetail.sendMessage") || "Send Message"}
            </button>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">
              {t("orderDetail.orderStatus") || "Order Status"}
            </p>
            <div
              className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${config.bgColor} ${config.color}`}
            >
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-border rounded-xl bg-background-secondary p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
          {t("orderDetail.timeline") || "Timeline"}
        </h3>
        <div className="space-y-3 text-sm">
          {/* Order Created */}
          <div className="flex gap-3">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
            <div>
              <p className="font-medium text-text-primary">
                {t("orderDetail.orderCreated") || "Order Created"}
              </p>
              <p className="text-xs text-text-secondary">
                {convertTimestampToDate(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <>
              {order.statusHistory.map((history, idx) => {
                const historyConfig = statusConfig[history.status];
                const isRevisionRequest = history.note?.includes("Revision Requested") || history.note?.includes("ຂໍແກ້ໄຂ");
                const isCompleted = ["completed", "delivered"].includes(history.status) && !isRevisionRequest;
                return (
                  <div key={idx} className="flex gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                        isRevisionRequest 
                          ? "bg-amber-500" 
                          : isCompleted 
                          ? "bg-success" 
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <div>
                      <p className={`font-medium ${
                        isRevisionRequest 
                          ? "text-amber-600" 
                          : "text-text-primary"
                      }`}>
                        {historyConfig?.label || history.status}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {convertTimestampToDate(history.timestamp).toLocaleString()}
                      </p>
                      {history.note && (
                        <p className={`text-xs mt-1 italic ${
                          isRevisionRequest 
                            ? "text-amber-600" 
                            : "text-text-secondary"
                        }`}>
                          {history.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Revision Requests */}
          {(order.revisionRequests || []).length > 0 && (
            <>
              {(order.revisionRequests || []).map((rev, idx) => (
                <div key={`rev-${idx}`} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-error flex-shrink-0 mt-2"></div>
                  <div>
                    <p className="font-medium text-error">
                      {t("orderDetail.revisionRequested") || "Revision Requested"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {convertTimestampToDate(rev.requestedAt).toLocaleString()}
                    </p>
                    {rev.reason && (
                      <p className="text-xs text-error mt-1">
                        {rev.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
