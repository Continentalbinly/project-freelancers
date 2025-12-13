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

  return (
    <div className="mb-8 bg-background-secondary rounded-xl p-6 border border-border">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        {t("orderDetail.orderProgress") || "Order Progress"}
      </h3>
      <Stepper steps={stepLabels} current={currentIndex} progressPosition="center" />
    </div>
  );
}
