"use client";

import { useState, Fragment } from "react";
import TransactionRow from "./TransactionRow";
import TransactionFilters from "./TransactionFilters";
import type { Transaction } from "../page";

function formatDate(tx: Transaction) {
  return tx.createdAt
    ? new Date(tx.createdAt.toDate()).toLocaleDateString()
    : "Unknown";
}

export default function TransactionTable({
  transactions,
  loading,
  t,
}: {
  transactions: Transaction[];
  loading: boolean;
  t: any;
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );

  if (transactions.length === 0)
    return (
      <p className="text-center text-text-secondary py-10">
        {t("transactions.empty")}
      </p>
    );

  /** APPLY FILTERS */
  const filtered = transactions.filter((tx) => {
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchType && matchStatus;
  });

  /** SORT BY DATE DESC (already sorted but safe) */
  filtered.sort((a, b) => {
    const da = a.createdAt?.toDate().getTime() || 0;
    const db = b.createdAt?.toDate().getTime() || 0;
    return db - da;
  });

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <TransactionFilters
        t={t}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        setTypeFilter={setTypeFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* === DESKTOP TABLE === */}
      <div className="hidden md:block border border-border rounded-xl overflow-hidden shadow-sm bg-background">
        <table className="min-w-full text-sm">
          <thead className="">
            <tr>
              <th className="px-5 py-3">{t("transactions.columns.type")}</th>
              <th className="px-5 py-3">{t("transactions.columns.amount")}</th>
              <th className="px-5 py-3">{t("transactions.columns.method")}</th>
              <th className="px-5 py-3">{t("transactions.columns.status")}</th>
              <th className="px-5 py-3">{t("transactions.columns.id")}</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tx, index) => {
              const currentDate = formatDate(tx);
              const prevDate =
                index > 0 ? formatDate(filtered[index - 1]) : null;

              const showDateHeader = currentDate !== prevDate;

              return (
                <Fragment key={tx.id}>
                  {showDateHeader && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-text-secondary text-xs font-semibold px-5 py-2"
                      >
                        {currentDate}
                      </td>
                    </tr>
                  )}

                  <TransactionRow tx={tx} t={t} />
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* === MOBILE LIST === */}
      <div className="block md:hidden space-y-5">
        {filtered.map((tx, index) => {
          const currentDate = formatDate(tx);
          const prevDate = index > 0 ? formatDate(filtered[index - 1]) : null;

          const showDateHeader = currentDate !== prevDate;

          return (
            <Fragment key={tx.id}>
              {showDateHeader && (
                <p className="text-xs font-semibold text-text-secondary">
                  {currentDate}
                </p>
              )}

              <TransactionRow tx={tx} t={t} isCard />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
