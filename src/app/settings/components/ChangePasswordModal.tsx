"use client";

import { useState, useEffect } from "react";
import { KeyIcon } from "@heroicons/react/24/outline";
import Modal from "@/app/components/Modal";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Props {
  onClose: () => void;
  user: any;
}

export default function ChangePasswordModal({ onClose, user }: Props) {
  const { t } = useTranslationContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (newPassword !== confirmPassword) {
      setMessage({
        text: t("modal.changePassword.passwordMismatch"),
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage({ text: t("modal.changePassword.success"), type: "success" });
      setSubmitted(true);
    } catch (err: any) {
      setMessage({
        text: err.message || t("modal.changePassword.failed"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title={t("modal.changePassword.title")}
      icon={<KeyIcon className="w-6 h-6" />}
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
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("modal.changePassword.currentPassword")}
            </label>
            <input suppressHydrationWarning
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("modal.changePassword.newPassword")}
            </label>
            <input suppressHydrationWarning
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("modal.changePassword.confirmNewPassword")}
            </label>
            <input suppressHydrationWarning
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              {t("modal.changePassword.cancel")}
            </button>
            <button suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading
                ? t("modal.changePassword.updating")
                : t("modal.changePassword.updatePassword")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
