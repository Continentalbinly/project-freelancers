"use client";

import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function EmailVerificationButton() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    text: string;
    type: "info" | "error";
  }>({ text: "", type: "info" });
  const [loading, setLoading] = useState(false);

  async function sendVerification() {
    if (!user) return;
    setLoading(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/login`,
      });
      setStatus({
        text: "Verification email sent! Please check your inbox.",
        type: "info",
      });
    } catch (e: any) {
      setStatus({
        text: e.message || "Failed to send verification email.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      {status.text && (
        <div
          className={`text-xs mb-2 px-3 py-2 rounded-md border ${
            status.type === "error"
              ? "text-error bg-error/10 border-error/20"
              : "text-success bg-success/10 border-success/20"
          }`}
        >
          {status.text}
        </div>
      )}
      <button suppressHydrationWarning
        onClick={sendVerification}
        disabled={loading}
        className="btn btn-outline text-xs py-1 px-3"
      >
        {loading ? "Sending..." : "Send verification email"}
      </button>
    </div>
  );
}
