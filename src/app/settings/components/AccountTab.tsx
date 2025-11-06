"use client";
import { useState } from "react";
import {
  LockClosedIcon,
  KeyIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import EmailVerificationButton from "./EmailVerificationButton";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";

export default function AccountTab() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const [showEmail, setShowEmail] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg">
        <h4 className="font-medium mb-2">Email</h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-mono">{user?.email}</span>
          {user?.emailVerified ? (
            <span className="text-success text-xs font-semibold bg-success/10 px-2 py-1 rounded">
              Verified
            </span>
          ) : (
            <span className="text-error text-xs font-semibold bg-error/10 px-2 py-1 rounded">
              Not verified
            </span>
          )}
        </div>
        {!user?.emailVerified && <EmailVerificationButton />}
      </div>

      <div className="p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <LockClosedIcon className="w-5 h-5 text-primary" />
          <h4 className="font-medium">
            {t("settings.accountSettings.accountSecurity.title")}
          </h4>
        </div>
        <div className="flex flex-col gap-3">
          <button suppressHydrationWarning
            onClick={() => setShowEmail(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <EnvelopeIcon className="w-5 h-5 text-primary" />
            {t("settings.accountSettings.accountSecurity.changeEmail")}
          </button>
          <button suppressHydrationWarning
            onClick={() => setShowPass(true)}
            className="btn btn-outline flex items-center gap-2"
          >
            <KeyIcon className="w-5 h-5 text-primary" />
            {t("settings.accountSettings.accountSecurity.changePassword")}
          </button>
        </div>
      </div>

      {showEmail && (
        <ChangeEmailModal onClose={() => setShowEmail(false)} user={user} />
      )}
      {showPass && (
        <ChangePasswordModal onClose={() => setShowPass(false)} user={user} />
      )}
    </div>
  );
}
