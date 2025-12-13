"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import { convertTimestampToDate } from "@/service/timeUtils";
import { DollarSign, Calendar, Package, Clock, RotateCcw } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderDetailsCardProps {
  order: Order;
}

export default function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  const { t } = useTranslationContext();

  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">
        {t("orderDetail.orderDetails") || "Order Details"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              {t("orderDetail.totalPrice") || "Total Price"}
            </p>
            <p className="text-xl font-bold text-text-primary">
              {order.packagePrice?.toLocaleString()} {t("orderDetail.currencyLAK") || "LAK"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              {t("orderDetail.orderDate") || "Order Date"}
            </p>
            <p className="font-semibold text-text-primary">
              {convertTimestampToDate(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">{t("orderDetail.status") || "Status"}</p>
            <p className="font-semibold text-text-primary capitalize">
              {order.status.replace("_", " ")}
            </p>
          </div>
        </div>

        {order.deliveryDays && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {t("orderDetail.deliveryTime") || "Delivery Time"}
              </p>
              <p className="font-semibold text-text-primary">
                {order.deliveryDays} {t("checkout.days") || "days"}
              </p>
            </div>
          </div>
        )}

        {order.orderFee !== undefined && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {t("orderDetail.orderFee") || "Order Fee"}
              </p>
              <p className="font-semibold text-text-primary">
                {order.orderFee?.toLocaleString()} {t("common.credits") || "LAK"}
              </p>
            </div>
          </div>
        )}

        {order.revisionLimit !== undefined && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">
                {t("orderDetail.revisionQuota") || "Revision Quota"}
              </p>
              <p className="font-semibold text-text-primary">
                {order.revisionCount || 0} / {order.revisionLimit} {t("common.used") || "used"}
              </p>
            </div>
          </div>
        )}
      </div>

      {order.requirements && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-text-secondary mb-2">
            {t("orderDetail.requirements") || "Requirements"}
          </p>
          <p className="text-text-primary">{order.requirements}</p>
        </div>
      )}
    </div>
  );
}
