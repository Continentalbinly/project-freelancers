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
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-500`}
    >
      {/* Glow background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`}
      />

      <div className="relative flex items-center justify-between p-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {loading ? (
            <div className="w-20 h-6 mt-2 bg-gray-200 animate-pulse rounded-md" />
          ) : (
            <motion.p
              key={value} // triggers animation when value updates
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-gray-900 mt-1 tracking-tight"
            >
              {value}
            </motion.p>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 shadow-inner flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
