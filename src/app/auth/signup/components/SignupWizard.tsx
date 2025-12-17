"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { signupUser } from "@/service/auth-client";
import type { SignupCredentials } from "@/types/auth";

import StepIndicator from "./StepIndicator";
import RoleStep from "./steps/RoleStep";
import AccountStep from "./steps/AccountStep";
import ProfileStep from "./steps/ProfileStep";
import ReviewStep from "./steps/ReviewStep";
import StepNavigation from "./StepNavigation";
import SignupSkeleton from "./SignupSkeleton";

const TOTAL_STEPS = 4;

export default function SignupWizard() {
  const { t } = useTranslationContext();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<SignupCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "freelancer",
    occupation: undefined,
    avatarUrl: "",
    bio: "",
    skills: [],
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    acceptMarketingEmails: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.role;
      case 2: {
        // Check basic password strength criteria
        const password = formData.password;
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const criteriaCount = [hasLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
        
        return (
          !!formData.fullName &&
          !!formData.email &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          hasLength &&
          criteriaCount >= 3 && // Require at least Fair strength (3+ criteria)
          !!formData.confirmPassword &&
          formData.confirmPassword === formData.password // Passwords must match
        );
      }
      case 3:
        return true;
      case 4:
        return !!formData.acceptTerms && !!formData.acceptPrivacyPolicy;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && isStepValid()) {
      setCurrentStep((s) => s + 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === TOTAL_STEPS && isStepValid()) {
      // On last step, trigger form submission
      handleSubmit(new Event('submit') as any);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e?: React.FormEvent | Event) => {
    if (e) {
      e.preventDefault();
    }
    
    // Only allow submission on last step
    if (currentStep !== TOTAL_STEPS) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const result = await signupUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role,
        formData.avatarUrl,
        {
          role: formData.role,
          occupation: formData.occupation,
          skills: formData.skills,
          bio: formData.bio,
          acceptTerms: formData.acceptTerms,
          acceptPrivacyPolicy: formData.acceptPrivacyPolicy,
          acceptMarketingEmails: formData.acceptMarketingEmails,
        }
      );

      if (result.success) {
        router.push(result.requiresVerification ? "/auth/verify-email" : "/");
      } else {
        setError(result.error || t("auth.signup.errors.signupFailed"));
      }
    } catch (err) {
      setError(t("auth.signup.errors.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return <SignupSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-2xl shadow-lg border border-border overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-background-secondary sm:px-8 py-8">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Content */}
      <div className="px-6 sm:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm flex items-start gap-3" style={{ backgroundColor: "color-mix(in oklab, var(--error) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--error) 30%, transparent)", color: "var(--error)" }}>
            <span className="text-lg flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Steps */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <RoleStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <AccountStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <ProfileStep
              formData={formData}
              setFormData={setFormData}
              uploading={uploading}
              setUploading={setUploading}
              error={error}
              setError={setError}
            />
          )}
          {currentStep === 4 && (
            <ReviewStep formData={formData} setFormData={setFormData} />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-border">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            isValid={isStepValid()}
            loading={loading}
            uploading={uploading}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </form>
  );
}
