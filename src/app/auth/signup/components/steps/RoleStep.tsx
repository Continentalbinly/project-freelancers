"use client";

import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { SignupCredentials } from "@/types/auth";

interface RoleStepProps {
  formData: SignupCredentials;
  setFormData: (data: SignupCredentials) => void;
}

export default function RoleStep({ formData, setFormData }: RoleStepProps) {
  const { t } = useTranslationContext();

  const roles = [
    {
      id: "freelancer",
      icon: "💼",
      title: t("auth.signup.roles.freelancer.title") || "Freelancer",
      description: t("auth.signup.roles.freelancer.description") || "Offer your skills and services",
    },
    {
      id: "client",
      icon: "🎯",
      title: t("auth.signup.roles.client.title") || "Client",
      description: t("auth.signup.roles.client.description") || "Hire talented professionals",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.role.title") || "What brings you here?"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.role.subtitle") || "Choose your account type to get started"}
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => setFormData({ ...formData, role: role.id as "freelancer" | "client" })}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              formData.role === role.id
                ? "border-primary bg-primary-light scale-105"
                : "border-border hover:border-primary bg-background"
            }`}
          >
            <div className="text-4xl mb-3">{role.icon}</div>
            <h3 className="text-lg font-semibold text-text mb-2">{role.title}</h3>
            <p className="text-text-secondary text-sm">{role.description}</p>

            {/* Checkmark */}
            {formData.role === role.id && (
              <div className="mt-4 flex items-center gap-2 text-primary font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("common.selected") || "Selected"}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg text-sm" style={{ backgroundColor: "color-mix(in oklab, var(--info) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--info) 30%, transparent)", color: "var(--info)" }}>
        <p className="font-medium mb-1">💡 {t("common.tip") || "Tip"}:</p>
        <p>
          {formData.role === "freelancer"
            ? t("auth.signup.roles.freelancer.info") ||
              "You can offer your expertise and build your client base. Set your rates and manage projects."
            : t("auth.signup.roles.client.info") ||
              "You can hire skilled freelancers to complete your projects. Post jobs and collaborate."}
        </p>
      </div>
    </div>
  );
}
