"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupUser } from "@/service/auth-client";
import { SignupCredentials } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import ProgressSteps from "./components/ProgressSteps";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2PersonalInfo from "./components/Step2PersonalInfo";
import Step3Terms from "./components/Step3Terms";
import NavigationButtons from "./components/NavigationButtons";

export default function SignupPage() {
  const { t } = useTranslationContext();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // ✅ Define all hooks *first*
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
    userCategory: "", // ✅ empty
    clientCategory: "", // ✅ empty
    occupation: "",
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    acceptMarketingEmails: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);

  // ✅ Redirect effect (safe hook order)
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // ✅ Loading / Redirect UI (after all hooks are defined)
  const showRedirecting = authLoading || user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const mainRole = formData.userRoles[0] || "freelancer";
      const category =
        mainRole === "freelancer"
          ? formData.userCategory
          : formData.clientCategory;
      const occupation = category ? `${mainRole}_${category}` : mainRole;

      const initialBillingData = {
        credit: 0,
        plan: "free",
        planStatus: "inactive",
        planStartDate: null,
        planEndDate: null,
        totalTopups: 0,
        totalSpentOnPlans: 0,
      };

      const result = await signupUser(
        formData.email,
        formData.password,
        formData.fullName,
        mainRole,
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

      if (result.success) {
        router.push(result.requiresVerification ? "/auth/verify-email" : "/");
      } else {
        setError(result.error || t("auth.signup.errors.signupFailed"));
      }
    } catch (err) {
      //console.error("❌ Signup error:", err);
      setError(t("auth.signup.errors.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

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
        if (formData.userRoles.includes("freelancer"))
          return !!formData.userCategory;
        if (formData.userRoles.includes("client"))
          return !!formData.clientCategory;
        return true;
      case 3:
        return formData.acceptTerms && formData.acceptPrivacyPolicy;
      default:
        return false;
    }
  };

  const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // ✅ render redirecting state AFTER all hooks
  if (showRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-text-secondary">
            {t("common.loading") || "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Regular render
  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 shadow-lg rounded-lg border border-border w-full max-w-4xl mx-auto">
      <div className="text-center mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-2">
          {t("auth.signup.title")}
        </h2>
        <p className="text-text-secondary text-sm sm:text-base lg:text-lg">
          {t("auth.signup.subtitle")}
        </p>
        <ProgressSteps currentStep={currentStep} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 lg:space-y-8"
      >
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-3 rounded-lg text-sm sm:text-base">
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
