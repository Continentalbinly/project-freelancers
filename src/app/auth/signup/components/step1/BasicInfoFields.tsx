"use client";

import { useState } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface BasicInfoFieldsProps {
  formData: SignupCredentials;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function BasicInfoFields({
  formData,
  handleChange,
}: BasicInfoFieldsProps) {
  const { t } = useTranslationContext();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMatchError(value !== formData.password);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 🧍 Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold   mb-2 sm:mb-3"
        >
          {t("auth.signup.step1.fullName")}
        </label>
        <input
          suppressHydrationWarning
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          placeholder={t("auth.signup.step1.fullNamePlaceholder")}
        />
      </div>

      {/* ✉️ Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold   mb-2 sm:mb-3"
        >
          {t("auth.signup.step1.email")}
        </label>
        <input
          suppressHydrationWarning
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          placeholder={t("auth.signup.step1.emailPlaceholder")}
        />
      </div>

      {/* 🔒 Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold   mb-2 sm:mb-3"
        >
          {t("auth.signup.step1.password")}
        </label>
        <input
          suppressHydrationWarning
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => {
            handleChange(e);
            setPasswordMatchError(e.target.value !== confirmPassword);
          }}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-background 
            ${
              passwordMatchError
                ? "border-error focus:ring-error"
                : "border-border focus:ring-primary"
            } 
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
          placeholder={t("auth.signup.step1.passwordPlaceholder")}
        />
      </div>

      {/* 🔒 Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold   mb-2 sm:mb-3"
        >
          {t("auth.signup.step1.confirmPassword") || "Confirm Password"}
        </label>
        <input
          suppressHydrationWarning
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={handleConfirmChange}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg bg-background 
            ${
              passwordMatchError
                ? "border-error focus:ring-error"
                : "border-border focus:ring-primary"
            } 
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
          placeholder={
            t("auth.signup.step1.confirmPasswordPlaceholder") ||
            "Re-enter your password"
          }
        />
        {passwordMatchError && (
          <p className="text-error text-sm mt-1">
            {t("auth.signup.step1.passwordsDoNotMatch") ||
              "Passwords do not match"}
          </p>
        )}
      </div>
    </div>
  );
}
