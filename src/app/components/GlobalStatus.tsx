"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GlobalStatusProps {
  type: "loading" | "verify" | "denied";
  message?: string;
}

/**
 * GlobalStatus — reusable full-screen feedback for loading & restricted access.
 */
export default function GlobalStatus({ type, message }: GlobalStatusProps) {
  let title = "";
  let subtitle = "";

  switch (type) {
    case "loading":
      title = "Loading...";
      subtitle = message || "Please wait a moment.";
      break;

    case "verify":
      title = "Verify your email";
      subtitle =
        message ||
        "Please check your inbox and verify your email address before continuing.";
      break;

    case "denied":
      title = "Access denied";
      subtitle = message || "You don’t have permission to view this page.";
      break;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center"
      >
        {type === "loading" && (
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        )}
        {type !== "loading" && (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-primary text-3xl">
              {type === "verify" ? "📧" : "🚫"}
            </span>
          </div>
        )}

        <h1 className="text-lg font-semibold  ">{title}</h1>
        <p className="text-sm text-text-secondary mt-1 max-w-sm">{subtitle}</p>
      </motion.div>
    </div>
  );
}
