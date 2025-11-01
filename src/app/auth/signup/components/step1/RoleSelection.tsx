"use client";

import { Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface RoleSelectionProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
}

export default function RoleSelection({
  formData,
  setFormData,
}: RoleSelectionProps) {
  const { t } = useTranslationContext();

  const handleRoleChange = (role: "freelancer" | "client") => {
    // ✅ only one role at a time
    setFormData((prev) => ({
      ...prev,
      userRoles: [role],
      userType: role, // ✅ string, not array
    }));
  };

  const selectedRole = formData.userRoles[0] || "";

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3 sm:mb-4">
        {t("auth.signup.step1.roleTitle")}
      </label>

      <div className="space-y-3 sm:space-y-4">
        {/* Freelancer */}
        <label
          className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedRole === "freelancer"
              ? "border-primary bg-primary-light/20"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => handleRoleChange("freelancer")}
        >
          <input
            type="radio"
            name="role"
            checked={selectedRole === "freelancer"}
            onChange={() => handleRoleChange("freelancer")}
            className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-primary focus:ring-primary border-border"
          />
          <div className="ml-3 sm:ml-4 flex-1">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-base sm:text-lg font-semibold text-text-primary">
                {t("auth.signup.step1.freelancer.title")}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {t("auth.signup.step1.freelancer.description")}
            </p>
          </div>
        </label>

        {/* Client */}
        <label
          className={`relative flex items-start p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedRole === "client"
              ? "border-secondary bg-secondary-light/20"
              : "border-border hover:border-secondary/50"
          }`}
          onClick={() => handleRoleChange("client")}
        >
          <input
            type="radio"
            name="role"
            checked={selectedRole === "client"}
            onChange={() => handleRoleChange("client")}
            className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-secondary focus:ring-secondary border-border"
          />
          <div className="ml-3 sm:ml-4 flex-1">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <span className="text-base sm:text-lg font-semibold text-text-primary">
                {t("auth.signup.step1.client.title")}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {t("auth.signup.step1.client.description")}
            </p>
          </div>
        </label>
      </div>

      {!selectedRole && (
        <p className="text-sm text-error mt-3">
          {t("auth.signup.step1.roleError")}
        </p>
      )}
    </div>
  );
}
