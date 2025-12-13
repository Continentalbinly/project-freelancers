"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import type { Order } from "@/types/order";

interface ClientSectionProps {
  order: Order;
  updating: boolean;
  onAcceptDelivery: () => Promise<void>;
  onRequestRevision: (reason: string) => Promise<void>;
}

export default function ClientSection({ 
  order, 
  updating, 
  onAcceptDelivery,
  onRequestRevision,
}: ClientSectionProps) {
  const { t } = useTranslationContext();
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Only show for delivered status
  if (order.status !== "delivered") return null;

  const revisionLimit = order.revisionLimit || 2;
  const revisionCount = order.revisionCount || 0;
  const revisionsRemaining = revisionLimit - revisionCount;
  const canRequestRevision = revisionsRemaining > 0;

  const handleRevisionSubmit = async () => {
    if (!revisionReason.trim()) {
      toast.error(t("orderDetail.pleaseEnterRevisionReason") || "Please enter revision reason");
      return;
    }
    setSubmitting(true);
    try {
      await onRequestRevision(revisionReason);
      setRevisionReason("");
      setShowRevisionForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-success" />
        <h2 className="text-lg font-semibold text-text-primary">
          {t("orderDetail.reviewDelivery") || "Review Delivery"}
        </h2>
      </div>
      <p className="text-sm text-text-secondary">
        {t("orderDetail.reviewDeliveryDesc") ||
          "Review the work and accept the delivery to complete the order."}
      </p>

      {/* Delivery Screenshots Review (ONLY for file delivery) */}
      {order.deliveryType === "file" && order.deliveryScreenshots && order.deliveryScreenshots.length > 0 && (
        <div className="space-y-3 p-4 bg-primary/5 border border-primary/30 rounded-lg">
          <p className="text-sm font-medium text-text-primary">
            {t("orderDetail.deliveryScreenshots") || "Screenshots"}
          </p>
          <p className="text-xs text-text-secondary">
            {t("orderDetail.screenshotsHelp") || "Review the screenshots to verify the work"}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {order.deliveryScreenshots.map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => window.open(url, "_blank")}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Content for Text/GitHub (shown in review) */}
      {order.deliveryType !== "file" && order.delivery && (
        <div className="p-4 bg-background border border-border rounded-lg">
          <p className="text-sm font-medium text-text-primary mb-2">
            {order.deliveryType === "github" 
              ? t("orderDetail.githubLink") || "GitHub Link"
              : t("orderDetail.deliveryMessage") || "Delivery Message"}
          </p>
          {order.deliveryType === "github" ? (
            <a href={order.delivery} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
              {order.delivery}
            </a>
          ) : (
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{order.delivery}</p>
          )}
        </div>
      )}

      {/* Revision Quota Info */}
      {revisionLimit > 0 && (
        <div className={`p-3 rounded-lg border ${
          canRequestRevision 
            ? "bg-blue-50 border-blue-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <p className={`text-sm font-medium ${
            canRequestRevision 
              ? "text-blue-700" 
              : "text-red-700"
          }`}>
            {t("orderDetail.revisionsRemaining") || "Revisions Remaining"}: {revisionsRemaining} / {revisionLimit}
          </p>
        </div>
      )}

      {/* Revision Form */}
      {showRevisionForm ? (
        <div className="space-y-3 p-4 bg-background rounded-lg border border-border">
          <label className="block text-sm font-medium text-text-primary">
            {t("orderDetail.revisionReason") || "What needs to be revised?"}
          </label>
          <textarea
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background-secondary focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            placeholder={t("orderDetail.revisionReasonPlaceholder") || "Describe what needs to be fixed or changed..."}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowRevisionForm(false);
                setRevisionReason("");
              }}
              className="px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-background transition-all"
            >
              {t("common.cancel") || "Cancel"}
            </button>
            <button
              onClick={handleRevisionSubmit}
              disabled={submitting || !revisionReason.trim()}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              {submitting 
                ? t("common.submitting") || "Submitting..." 
                : t("orderDetail.requestRevision") || "Request Revision"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {canRequestRevision && (
            <button
              onClick={() => setShowRevisionForm(true)}
              disabled={updating}
              className="px-6 py-2.5 rounded-lg border border-amber-500 text-amber-600 font-medium hover:bg-amber-50 transition-all disabled:opacity-50"
            >
              {t("orderDetail.requestRevision") || "Request Revision"}
            </button>
          )}
          <button
            onClick={onAcceptDelivery}
            disabled={updating}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
          >
            {updating
              ? t("orderDetail.processingPayment") || "Processing Payment..."
              : t("orderDetail.acceptAndPayout") || "Accept & Process Payout"}
          </button>
        </div>
      )}

      {!canRequestRevision && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {t("orderDetail.noMoreRevisions") || "No more revisions available. Please accept or reject the delivery."}
          </p>
        </div>
      )}
    </div>
  );
}
