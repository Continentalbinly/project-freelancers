"use client";

import { useState } from "react";
import Link from "next/link";
import { signupUser } from "@/service/auth-client";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import ProgressSteps from "./components/ProgressSteps";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3Terms from "./components/Step3Terms";
import NavigationButtons from "./components/NavigationButtons";

export default function SignupPage() {
  const { t } = useTranslationContext();

  const [formData, setFormData] = useState<SignupCredentials>({
    email: "",
    password: "",
    fullName: "",
    userType: "freelancer",
    userRoles: ["freelancer"],
    avatarUrl: "",
    dateOfBirth: "",
    gender: "prefer_not_to_say",
    phone: "",
    location: "",
    country: "",
    city: "",
    university: "",
    fieldOfStudy: "",
    graduationYear: "",
    skills: [],
    bio: "",
    institution: "",
    department: "",
    position: "",
    yearsOfExperience: 0,
    userCategory: "student",
    clientCategory: "teacher",
    occupation: "",
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    acceptMarketingEmails: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Compute derived fields
      const mainRole = formData.userRoles[0] || "freelancer";
      const category =
        mainRole === "freelancer"
          ? formData.userCategory
          : formData.clientCategory;

      const occupation = category ? `${mainRole}_${category}` : mainRole;

      // ✅ Initial billing defaults
      const initialBillingData = {
        credit: 0,
        plan: "free",
        planStatus: "inactive",
        planStartDate: null,
        planEndDate: null,
        totalTopups: 0,
        totalSpentOnPlans: 0,
      };

      // ✅ Sign up user & create full profile in one step
      const result = await signupUser(
        formData.email,
        formData.password,
        formData.fullName,
        mainRole, // single string
        formData.avatarUrl,
        {
          userType: mainRole,
          userRoles: [mainRole],
          occupation,
          userCategory: formData.userCategory,
          clientCategory: formData.clientCategory,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          phone: formData.phone,
          location: formData.location,
          country: formData.country,
          city: formData.city,
          university: formData.university,
          fieldOfStudy: formData.fieldOfStudy,
          graduationYear: formData.graduationYear,
          skills: formData.skills,
          bio: formData.bio,
          institution: formData.institution,
          department: formData.department,
          position: formData.position,
          yearsOfExperience: formData.yearsOfExperience,
          acceptTerms: formData.acceptTerms,
          acceptPrivacyPolicy: formData.acceptPrivacyPolicy,
          acceptMarketingEmails: formData.acceptMarketingEmails,
          ...initialBillingData,
        }
      );

      // ✅ Handle result
      if (result.success) {
        if (result.requiresVerification) {
          window.location.href = "/auth/verify-email";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(result.error || t("auth.signup.errors.signupFailed"));
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      setError(t("auth.signup.errors.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validation per step
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return (
          !!formData.fullName &&
          !!formData.email &&
          !!formData.password &&
          formData.userRoles.length > 0
        );
      case 2:
        const basicValid =
          formData.dateOfBirth && formData.gender && formData.phone;
        if (!basicValid) return false;

        if (formData.userRoles.includes("freelancer")) {
          return !!formData.userCategory;
        }
        if (formData.userRoles.includes("client")) {
          return !!formData.clientCategory;
        }
        return true;
      case 3:
        return formData.acceptTerms && formData.acceptPrivacyPolicy;
      default:
        return false;
    }
  };

  // ✅ Step controls
  const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // ✅ Render
  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-2">
          {t("auth.signup.title")}
        </h2>
        <p className="text-text-secondary text-sm sm:text-base lg:text-lg">
          {t("auth.signup.subtitle")}
        </p>
        <ProgressSteps currentStep={currentStep} />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 lg:space-y-8"
      >
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <Step1BasicInfo
            formData={formData}
            setFormData={setFormData}
            uploading={uploading}
            setUploading={setUploading}
            error={error}
            setError={setError}
          />
        )}

        {currentStep === 2 && (
          <Step2PersonalInfo formData={formData} setFormData={setFormData} />
        )}

        {currentStep === 3 && (
          <Step3Terms formData={formData} setFormData={setFormData} />
        )}

        <NavigationButtons
          currentStep={currentStep}
          isStepValid={isStepValid()}
          loading={loading}
          uploading={uploading}
          prevStep={prevStep}
          nextStep={nextStep}
        />
      </form>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-text-secondary">
          {t("auth.signup.alreadyHaveAccount")}{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary-hover font-medium"
          >
            {t("auth.signup.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
