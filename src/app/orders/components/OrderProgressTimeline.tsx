"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { OrderStatus } from "@/types/order";
import Stepper from "@/app/(freelancer)/catalog/components/Stepper";

interface OrderProgressTimelineProps {
  status: OrderStatus;
}

export default function OrderProgressTimeline({ status }: OrderProgressTimelineProps) {
  const { t } = useTranslationContext();

  const statusOrder: OrderStatus[] = [
    "pending",
    "accepted",
    "in_progress",
    "delivered",
    "awaiting_payment",
    "completed",
  ];

  const stepLabels = [
    t("orderDetail.statusPending") || "Pending",
    t("orderDetail.statusAccepted") || "Accepted",
    t("orderDetail.statusInProgress") || "In Progress",
    t("orderDetail.statusDelivered") || "Delivered",
    t("orderDetail.statusAwaitingPayment") || "Awaiting Payment",
    t("orderDetail.statusCompleted") || "Completed",
  ];

  const rawIndex = statusOrder.indexOf(status);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;
  
  // When order is completed, show all steps as completed (including the final step with checkmark)
  // The Stepper component will handle showing the checkmark on the final step
  const displayIndex = status === "completed" ? stepLabels.length - 1 : currentIndex;

  return (
    <div className="mb-8 bg-background-secondary rounded-xl p-6 border border-border">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        {t("orderDetail.orderProgress") || "Order Progress"}
      </h3>
      <Stepper steps={stepLabels} current={displayIndex} progressPosition="center" />
    </div>
  );
}
