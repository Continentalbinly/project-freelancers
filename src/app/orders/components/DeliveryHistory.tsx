"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { CheckCircle, FileText, Github, MessageSquare } from "lucide-react";
import type { Order } from "@/types/order";

interface DeliveryHistoryProps {
  order: Order;
}

// Helper to convert Firestore timestamp or date
function getDateFromTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Date) return timestamp;
  
  if (typeof timestamp === "object" && timestamp !== null) {
    const ts = timestamp as Record<string, unknown>;
    if ("toDate" in ts && typeof ts.toDate === "function") {
      return (ts.toDate as () => Date)();
    }
    if ("seconds" in ts && typeof ts.seconds === "number") {
      return new Date(ts.seconds * 1000);
    }
  }
  
  return new Date();
}

export default function DeliveryHistory({ order }: DeliveryHistoryProps) {
  const { t } = useTranslationContext();

  if (!order.delivery && !order.deliveryFiles) return null;

  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-success" />
        {t("orderDetail.deliverySent") || "Delivery Sent"}
      </h2>

      {/* Show delivery type badge */}
      {order.deliveryType && (
        <div className="flex items-center gap-2">
          {order.deliveryType === "text" && <MessageSquare className="w-4 h-4" />}
          {order.deliveryType === "github" && <Github className="w-4 h-4" />}
          {order.deliveryType === "file" && <FileText className="w-4 h-4" />}
          <span className="text-sm font-medium text-text-secondary">
            {order.deliveryType === "text" && (t("orderDetail.textDelivery") || "Text Delivery")}
            {order.deliveryType === "github" && (t("orderDetail.githubDelivery") || "GitHub Link")}
            {order.deliveryType === "file" && (t("orderDetail.fileDelivery") || "File Upload")}
          </span>
        </div>
      )}

      {/* Delivery Content */}
      {order.delivery && (
        <div className="bg-background rounded-lg p-4 border border-border">
          {order.deliveryType === "github" ? (
            <a href={order.delivery} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
              {order.delivery}
            </a>
          ) : (
            <p className="text-text-primary whitespace-pre-wrap">{order.delivery}</p>
          )}
        </div>
      )}

      {/* Delivered Files - Only show in completed status, not delivered */}
      {order.status === "completed" && order.deliveryFiles && order.deliveryFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">
            {t("common.deliveredFiles") || "Delivered Files"}
          </p>
          {order.deliveryFiles.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg text-sm text-primary hover:bg-primary/5 transition-colors"
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1">{url.split("/").pop()}</span>
            </a>
          ))}
        </div>
      )}

      {/* Revision Request Notice */}
      {order.revisionRequests && order.revisionRequests.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-amber-600 mb-3">
            {t("orderDetail.revisionRequested") || "Revision Requested"}
          </p>
          {order.revisionRequests.map((req, idx) => (
            <div key={idx} className="mb-3 last:mb-0 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-900 font-medium mb-1">
                {getDateFromTimestamp(req.requestedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-amber-800">{req.reason}</p>
              {req.freelancerNote && (
                <p className="text-xs text-amber-700 mt-2 italic">
                  Freelancer: {req.freelancerNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
