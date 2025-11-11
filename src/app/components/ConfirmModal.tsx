"use client";

import { ReactNode } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ConfirmModalProps {
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  title,
  children,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const { t } = useTranslationContext();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative animate-fadeIn">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
          {title}
        </h3>

        <div className="text-gray-600 text-sm sm:text-base mb-5">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 cursor-pointer rounded-md border border-gray-300 text-sm sm:text-base hover:bg-gray-50"
          >
            {cancelLabel || t("common.cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 cursor-pointer bg-primary text-white rounded-md text-sm sm:text-base hover:bg-primary-dark"
          >
            {loading
              ? t("common.processing")
              : confirmLabel || t("common.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
