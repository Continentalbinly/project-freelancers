"use client";
import React from "react";

export default function ProposalsFilter({
  statusFilter,
  setStatusFilter,
  t,
}: any) {
  return (
    <div className="bg-background border border-border rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="font-semibold text-sm flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full"></span>
          {t("proposals.filters.title")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        >
          <option value="all">{t("proposals.filters.allStatus")}</option>
          <option value="pending">{t("proposals.filters.pending")}</option>
          <option value="accepted">{t("proposals.filters.accepted")}</option>
          <option value="rejected">{t("proposals.filters.rejected")}</option>
          <option value="withdrawn">{t("proposals.filters.withdrawn")}</option>
        </select>
      </div>
    </div>
  );
}
