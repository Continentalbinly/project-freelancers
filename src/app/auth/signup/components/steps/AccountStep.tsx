"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { SignupCredentials } from "@/types/auth";
import { Eye, EyeClosed } from "lucide-react";

interface AccountStepProps {
  formData: SignupCredentials;
  setFormData: (data: SignupCredentials) => void;
}

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export default function AccountStep({
  formData,
  setFormData,
}: AccountStepProps) {
  const { t } = useTranslationContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    
    let score = 0;
    let label = "";
    let color = "";
    let bgColor = "";

    if (passedCriteria === 0 || password.length === 0) {
      score = 0;
      label = "";
      color = "";
      bgColor = "";
    } else if (passedCriteria <= 2) {
      score = 1;
      label = "weak";
      color = "rgb(239, 68, 68)"; // red-500
      bgColor = "rgba(239, 68, 68, 0.1)";
    } else if (passedCriteria === 3) {
      score = 2;
      label = "fair";
      color = "rgb(249, 115, 22)"; // orange-500
      bgColor = "rgba(249, 115, 22, 0.1)";
    } else if (passedCriteria === 4) {
      score = 3;
      label = "good";
      color = "rgb(234, 179, 8)"; // yellow-500
      bgColor = "rgba(234, 179, 8, 0.1)";
    } else {
      score = 4;
      label = "strong";
      color = "rgb(34, 197, 94)"; // green-500
      bgColor = "rgba(34, 197, 94, 0.1)";
    }

    return { score, label, color, bgColor, criteria };
  }, []);

  const validatePassword = useCallback((password: string) => {
    if (password.length === 0) return true;
    const strength = calculatePasswordStrength(password);
    return strength.score >= 2; // Require at least "Fair" strength
  }, [calculatePasswordStrength]);

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password, calculatePasswordStrength]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Debounce password validation while typing
    if (name === "password" && typingTimeout) {
      clearTimeout(typingTimeout);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...errors };

    if (name === "email" && value && !validateEmail(value)) {
      newErrors.email =
        t("auth.signup.errors.invalidEmail") || "Please enter a valid email";
    } else if (name === "password" && value && !validatePassword(value)) {
      newErrors.password =
        t("auth.signup.errors.passwordTooWeak") ||
        "Password is too weak. Include uppercase, lowercase, numbers, and special characters.";
    } else if (name === "confirmPassword" && value && value !== formData.password) {
      newErrors.confirmPassword =
        t("auth.signup.errors.passwordsDoNotMatch") || "Passwords do not match";
    } else if (name === "fullName" && value.trim().length < 2) {
      newErrors.fullName =
        t("auth.signup.errors.nameRequired") || "Please enter your full name";
    }

    setErrors(newErrors);
  };

  const handlePasswordStopTyping = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      if (formData.password && !validatePassword(formData.password)) {
        setErrors({
          ...errors,
          password:
            t("auth.signup.errors.passwordTooWeak") ||
            "Password is too weak. Include uppercase, lowercase, numbers, and special characters.",
        });
      }
    }, 1000); // Validate after 1 second of no typing
    setTypingTimeout(timeout);
  };

  useEffect(() => {
    handlePasswordStopTyping();
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [formData.password]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.account.title") || "Create your account"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.account.subtitle") ||
            "Set up your login credentials"}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.fullName") || "Full Name"} *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t("auth.signup.placeholders.fullName") || "John Doe"}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
              errors.fullName
                ? "border-error"
                : "border-border focus:border-primary bg-background"
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-error">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.email") || "Email Address"} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={
              t("auth.signup.placeholders.email") || "you@example.com"
            }
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
              errors.email
                ? "border-error"
                : "border-border focus:border-primary bg-background"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text"
            >
              {t("auth.signup.fields.password") || "Password"} *
            </label>
            <span className="text-xs text-text-secondary">
              {t("auth.signup.fields.passwordRequirement") ||
                "Min. 8 characters"}
            </span>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t("auth.signup.placeholders.password") || "••••••••"}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                errors.password
                  ? "border-error"
                  : "border-border focus:border-primary bg-background"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeClosed className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordStrength && passwordStrength.score > 0 && (
            <div className="mt-3 space-y-2">
              {/* Strength Bar */}
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : "rgb(229, 231, 235)", // gray-200
                    }}
                  />
                ))}
              </div>

              {/* Strength Label */}
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-medium"
                  style={{ color: passwordStrength.color }}
                >
                  {t(`auth.signup.passwordStrength.${passwordStrength.label}`) || passwordStrength.label}
                </p>
              </div>

              {/* Criteria Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.criteria.length
                        ? "bg-success"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {passwordStrength.criteria.length && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-text-secondary">{t("auth.signup.passwordStrength.criteria.length") || "8+ characters"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.criteria.uppercase
                        ? "bg-success"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {passwordStrength.criteria.uppercase && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-text-secondary">{t("auth.signup.passwordStrength.criteria.uppercase") || "Uppercase (A-Z)"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.criteria.lowercase
                        ? "bg-success"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {passwordStrength.criteria.lowercase && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-text-secondary">{t("auth.signup.passwordStrength.criteria.lowercase") || "Lowercase (a-z)"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.criteria.number
                        ? "bg-success"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {passwordStrength.criteria.number && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-text-secondary">{t("auth.signup.passwordStrength.criteria.number") || "Number (0-9)"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.criteria.special
                        ? "bg-success"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    {passwordStrength.criteria.special && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-text-secondary">{t("auth.signup.passwordStrength.criteria.special") || "Special character (!@#$%...)"}</span>
                </div>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="mt-2 text-sm text-error">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text mb-2"
          >
            {t("auth.signup.fields.confirmPassword") || "Confirm Password"} *
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={
                t("auth.signup.placeholders.confirmPassword") || "••••••••"
              }
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                errors.confirmPassword
                  ? "border-error"
                  : "border-border focus:border-primary bg-background"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
            >
              {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeClosed className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
          )}
          {formData.confirmPassword &&
            !errors.confirmPassword &&
            formData.password === formData.confirmPassword && (
              <p className="mt-2 text-xs text-success flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("auth.signup.validations.passwordsMatch") ||
                  "Passwords match"}
              </p>
            )}
        </div>
      </div>

      {/* Security Info */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{
          backgroundColor:
            "color-mix(in oklab, var(--warning) 10%, transparent)",
          border:
            "1px solid color-mix(in oklab, var(--warning) 30%, transparent)",
          color: "var(--warning)",
        }}
      >
        <p className="font-medium mb-1">
          🔒 {t("common.security") || "Security"}:
        </p>
        <p>
          {t("auth.signup.security.info") ||
            "Your password is encrypted and securely stored. Never share it with anyone."}
        </p>
      </div>
    </div>
  );
}
