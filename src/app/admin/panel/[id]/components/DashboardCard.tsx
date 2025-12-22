"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DashboardCard({
  title,
  value,
  icon,
  loading = false,
  color = "from-indigo-500/10 to-indigo-500/0",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-sm hover:shadow-lg transition-all duration-500`}
    >
      {/* Glow background */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${color} opacity-60`}
      />

      <div className="relative flex items-center justify-between p-6">
        <div>
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
          {loading ? (
            <div className="w-20 h-6 mt-2 animate-pulse rounded-md" />
          ) : (
            <motion.p
              key={value} // triggers animation when value updates
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-text-primary mt-1 tracking-tight"
            >
              {value}
            </motion.p>
          )}
        </div>

        <div className="shrink-0">
          <div className="p-3 rounded-xl bg-background flex items-center justify-center border border-border/60">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
