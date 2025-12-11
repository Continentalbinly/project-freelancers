"use client";

import { useState, useEffect } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/Modal";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Props {
  onClose: () => void;
  user: any;
}

export default function ChangeEmailModal({ onClose, user }: Props) {
  const { t } = useTranslationContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "";
  }>({ text: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, onClose]);

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
      setMessage({ text: t("modal.changeEmail.success"), type: "success" });
      setSubmitted(true);
    } catch (err: any) {
      setMessage({
        text: err.message || t("modal.changeEmail.failed"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title={t("modal.changeEmail.title")}
      icon={<EnvelopeIcon className="w-6 h-6" />}
    >
      {message.text && (
        <div
          className={`px-3 py-2 mb-3 rounded-md text-sm border ${
            message.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-error/10 border-error/20 text-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1  ">
              {t("modal.changeEmail.currentPassword")}
            </label>
            <input suppressHydrationWarning
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1  ">
              {t("modal.changeEmail.newEmail")}
            </label>
            <input suppressHydrationWarning
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              {t("modal.changeEmail.cancel")}
            </button>
            <button suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading
                ? t("modal.changeEmail.sending")
                : t("modal.changeEmail.sendConfirmationLink")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
