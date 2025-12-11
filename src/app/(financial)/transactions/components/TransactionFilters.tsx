"use client";

import { useState } from "react";
import { Search, Calendar, SlidersHorizontal, XCircle } from "lucide-react";

export default function TransactionFilters({
  t,
  typeFilter,
  statusFilter,
  setTypeFilter,
  setStatusFilter,
  searchText,
  setSearchText,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  resetFilters,
}: any) {
  const [openAdvanced, setOpenAdvanced] = useState(false); // Desktop expand
  const [openMobile, setOpenMobile] = useState(false); // Mobile expand

  const typeOptions = [
    { key: "all", label: t("transactions.filters.all") },
    { key: "topup", label: t("transactions.types.topup") },
    { key: "project_payout", label: t("transactions.types.project_payout") },
    { key: "payout_received", label: t("transactions.types.payout_received") },
    { key: "escrow_hold", label: t("transactions.types.escrowHold") },
    { key: "escrow_payment", label: t("transactions.types.escrowPayment") },
    { key: "escrow_release", label: t("transactions.types.escrow_release") },
    { key: "escrow_refund", label: t("transactions.types.escrowRefund") },
    { key: "posting_fee", label: t("transactions.types.posting_fee") },
    {
      key: "posting_fee_adjust",
      label: t("transactions.types.posting_fee_adjust"),
    },
    {
      key: "posting_fee_refund",
      label: t("transactions.types.posting_fee_refund"),
    },
    { key: "withdraw_request", label: t("transactions.types.withdrawRequest") },
    {
      key: "withdraw_request_success",
      label: t("transactions.types.withdrawSuccess"),
    },
    { key: "subscription", label: t("transactions.types.subscription") },
    { key: "refund", label: t("transactions.types.refund") },
  ];

  const statusOptions = [
    { key: "all", label: t("transactions.filters.all") },
    { key: "confirmed", label: t("transactions.status.confirmed") },
    { key: "pending", label: t("transactions.status.pending") },
    { key: "failed", label: t("transactions.status.failed") },
    { key: "expired", label: t("transactions.status.expired") },
  ];

  return (
    <div className="mb-6">
      <div className="p-5 border border-border rounded-xl shadow-sm space-y-5 bg-background">
        {/* DESKTOP FILTER ROW (4 COLUMNS) */}
        {/* DESKTOP FILTER ROW (4 COLUMNS) */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {/* SEARCH */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1 h-5">
              <Search className="w-3.5 h-3.5" />
              {t("transactions.filters.search")}
            </label>
            <input
              type="text"
              placeholder={t("transactions.filters.searchPlaceholder")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary placeholder-text-secondary"
            />
          </div>

          {/* TYPE */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1 h-5">
              {/* 🔥 Invisible icon to match label height */}
              <Search className="w-3.5 h-3.5 opacity-0" />
              {t("transactions.filters.type")}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
            >
              {typeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1 h-5">
              {/* 🔥 Invisible icon to keep label height equal */}
              <Search className="w-3.5 h-3.5 opacity-0" />
              {t("transactions.filters.status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* ADVANCED BUTTON */}
          <div className="flex items-end">
            <button
              onClick={() => setOpenAdvanced(!openAdvanced)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium transition bg-background-secondary text-text-primary hover:border-primary/50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {openAdvanced
                ? t("transactions.filters.hideAdvanced")
                : t("transactions.filters.advanced")}
            </button>
          </div>
        </div>

        {/* DESKTOP ADVANCED FILTERS */}
        {openAdvanced && (
          <div className="hidden md:grid grid-cols-2 gap-3">
            {/* DATE FROM */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t("transactions.filters.dateFrom")}
              </label>
              <input
                type="date"
                value={dateFrom || ""}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
              />
            </div>

            {/* DATE TO */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t("transactions.filters.dateTo")}
              </label>
              <input
                type="date"
                value={dateTo || ""}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
              />
            </div>
          </div>
        )}
        {/* 📱 MOBILE SEARCH (visible only on mobile & tablet) */}
        <div className="md:hidden space-y-1">
          <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            {t("transactions.filters.search")}
          </label>
          <input
            type="text"
            placeholder={t("transactions.filters.searchPlaceholder")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary placeholder-text-secondary"
          />
        </div>

        {/* MOBILE ADVANCED BUTTON */}
        <div className="md:hidden">
          <button
            onClick={() => setOpenMobile(!openMobile)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium transition bg-background-secondary text-text-primary hover:border-primary/50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {openMobile
              ? t("transactions.filters.hideAdvanced")
              : t("transactions.filters.advanced")}
          </button>
        </div>

        {/* MOBILE ADVANCED SECTION */}
        {openMobile && (
          <div className="md:hidden space-y-4 pt-2">
            {/* TYPE */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t("transactions.filters.type")}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t("transactions.filters.status")}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE RANGE */}
            <div className="grid grid-cols-2 gap-3">
              {/* DATE FROM */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t("transactions.filters.dateFrom")}
                </label>
                <input
                  type="date"
                  value={dateFrom || ""}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
                />
              </div>

              {/* DATE TO */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t("transactions.filters.dateTo")}
                </label>
                <input
                  type="date"
                  value={dateTo || ""}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background-secondary text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* RESET BUTTON */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 cursor-pointer text-red-600 text-xs font-medium hover:underline"
        >
          <XCircle className="w-3.5 h-3.5" />
          {t("transactions.filters.reset")}
        </button>
      </div>
    </div>
  );
}
