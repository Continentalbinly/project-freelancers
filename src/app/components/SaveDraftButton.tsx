"use client";

import { useState, useEffect } from "react";
import { Save, Check, AlertCircle } from "lucide-react";

interface SaveDraftButtonProps {
  onSave: () => Promise<void>;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export default function SaveDraftButton({
  onSave,
  label = "Save as Draft",
  successMessage = "Draft saved successfully!",
  errorMessage = "Failed to save draft",
  disabled = false,
}: SaveDraftButtonProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (status !== "idle") {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setStatus("idle");
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSave = async () => {
    if (saving || disabled) return;
    
    setSaving(true);
    try {
      await onSave();
      setStatus("success");
    } catch  {
      setStatus("error");
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  const message = status === "success" ? successMessage : errorMessage;
  const isSuccess = status === "success";

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 mb-16 sm:mb-0">
        <button
          onClick={handleSave}
          disabled={disabled || saving}
          className={`
            group relative px-6 py-3 sm:px-5 sm:py-2 rounded-full font-medium
            transition-all duration-300 ease-out
            flex items-center gap-2
            shadow-lg hover:shadow-xl
            ${
              disabled || saving
                ? "opacity-60 cursor-not-allowed bg-gray-400"
                : status === "success"
                ? "bg-success/90 hover:bg-success text-white"
                : status === "error"
                ? "bg-error/90 hover:bg-error text-white"
                : "bg-linear-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
            }
            scale-100 hover:scale-105 active:scale-95
          `}
          title={label}
        >
          {/* Icon with rotation animation */}
          <div
            className={`
              transition-all duration-300
              ${saving ? "animate-spin" : ""}
              ${status === "success" ? "scale-110" : "scale-100"}
            `}
          >
            {status === "success" ? (
              <Check className="w-5 h-5 sm:w-4 sm:h-4" />
            ) : status === "error" ? (
              <AlertCircle className="w-5 h-5 sm:w-4 sm:h-4" />
            ) : (
              <Save className="w-5 h-5 sm:w-4 sm:h-4" />
            )}
          </div>

          {/* Text - hide on very small screens */}
          <span className="hidden sm:inline text-sm">
            {saving ? "Saving..." : status === "success" ? "Saved!" : status === "error" ? "Error" : label}
          </span>
        </button>

        {/* Ripple effect on success */}
        {status === "success" && (
          <div className="absolute inset-0 rounded-full bg-success/30 animate-ping" />
        )}
      </div>

      {/* Toast Notification */}
      {showMessage && (
        <div
          className={`
            fixed bottom-24 left-1/2 -translate-x-1/2 z-50
            px-4 sm:px-6 py-3 rounded-lg shadow-lg
            flex items-center gap-2
            animate-in fade-in slide-in-from-bottom-4 duration-300
            ${
              isSuccess
                ? "bg-success/10 border border-success text-success"
                : "bg-error/10 border border-error text-error"
            }
          `}
        >
          {isSuccess ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm sm:text-base font-medium">{message}</span>
        </div>
      )}
    </>
  );
}
