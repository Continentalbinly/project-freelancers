"use client";

import { Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import BasicInfoFields from "./step1/BasicInfoFields";
import RoleSelection from "./step1/RoleSelection";
import ProfileImageUpload from "./step1/ProfileImageUpload";
import BenefitsSection from "./step1/BenefitsSection";

interface Step1BasicInfoProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
  uploading: boolean;
  setUploading: Dispatch<SetStateAction<boolean>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}

export default function Step1BasicInfo({
  formData,
  setFormData,
  uploading,
  setUploading,
  error,
  setError,
}: Step1BasicInfoProps) {
  const { t } = useTranslationContext();

  // ✅ Universal input handler (type-safe)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "userRoles") {
        const allowedRoles = ["freelancer", "client", "admin"] as const;
        if (allowedRoles.includes(value as any)) {
          return {
            ...prev,
            userRoles: [value as "freelancer" | "client" | "admin"],
          };
        }
        return prev;
      }
      return { ...prev, [name]: value };
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold   mb-2">
          {t("auth.signup.step1.title")}
        </h3>
        <p className="text-text-secondary">{t("auth.signup.step1.subtitle")}</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* ✅ Basic Fields */}
        <BasicInfoFields formData={formData} handleChange={handleChange} />

        {/* ✅ Role Selection */}
        <RoleSelection formData={formData} setFormData={setFormData} />

        {/* ✅ Profile Upload */}
        <ProfileImageUpload
          formData={formData}
          setFormData={setFormData}
          uploading={uploading}
          setUploading={setUploading}
          error={error}
          setError={setError}
        />
      </div>

      {/* ✅ Info / Benefits Section */}
      <BenefitsSection userRoles={formData.userRoles} />
    </div>
  );
}
