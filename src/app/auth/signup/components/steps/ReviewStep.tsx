"use client";

import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { SignupCredentials } from "@/types/auth";

interface ReviewStepProps {
  formData: SignupCredentials;
  setFormData: (data: SignupCredentials) => void;
}

export default function ReviewStep({ formData, setFormData }: ReviewStepProps) {
  const { t } = useTranslationContext();

  const getRoleLabel = () => {
    return formData.role === "freelancer"
      ? t("auth.signup.roles.freelancer.title") || "Freelancer"
      : t("auth.signup.roles.client.title") || "Client";
  };

  const getOccupationLabel = () => {
    const occ = formData.occupation as any;
    if (!occ) return "";
    if (typeof occ === "string") {
      // Backward compatibility for legacy string values
      const map: Record<string, string> = {
        developer: t("auth.signup.occupations.developer") || "Developer",
        designer: t("auth.signup.occupations.designer") || "Designer",
        writer: t("auth.signup.occupations.writer") || "Writer",
        marketer: t("auth.signup.occupations.marketer") || "Marketer",
        startup: t("auth.signup.occupations.startup") || "Startup",
        agency: t("auth.signup.occupations.agency") || "Agency",
        corporate: t("auth.signup.occupations.corporate") || "Corporate",
        individual: t("auth.signup.occupations.individual") || "Individual",
        other: t("auth.signup.occupations.other") || "Other",
      };
      return map[occ] || occ;
    }
    // Occupation object with multilingual names
    return t("language") === "English" ? occ.name_en : occ.name_lo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.review.title") || "Review your information"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.review.subtitle") || "Make sure everything is correct before creating your account"}
        </p>
      </div>

      {/* Account Section */}
      <div className="p-6 rounded-xl border border-border bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-text mb-4">
          {t("auth.signup.sections.account") || "Account Information"}
        </h3>
        <div className="space-y-3">
          <ReviewField
            label={t("auth.signup.fields.fullName") || "Full Name"}
            value={formData.fullName}
          />
          <ReviewField
            label={t("auth.signup.fields.email") || "Email Address"}
            value={formData.email}
          />
          <ReviewField
            label={t("auth.signup.fields.accountType") || "Account Type"}
            value={getRoleLabel()}
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-xl border border-border bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-text mb-4">
          {t("auth.signup.sections.profile") || "Profile Information"}
        </h3>
        <div className="space-y-4">
          {/* Avatar Preview */}
          {formData.avatarUrl && (
            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">
                {t("auth.signup.fields.profilePicture") || "Profile Picture"}
              </p>
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                <Image
                  src={formData.avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            </div>
          )}

          {/* Other fields */}
          {formData.occupation && (
            <ReviewField
              label={
                formData.role === "freelancer"
                  ? t("auth.signup.fields.profession") || "Profession"
                  : t("auth.signup.fields.companyType") || "Company Type"
              }
              value={getOccupationLabel()}
            />
          )}

          {formData.bio && (
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                {formData.role === "freelancer"
                  ? t("auth.signup.fields.bio.freelancer") || "About you"
                  : t("auth.signup.fields.bio.client") || "About your company"}
              </p>
              <p className="text-text whitespace-pre-wrap">{formData.bio}</p>
            </div>
          )}

          {formData.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">
                {t("auth.signup.fields.skills") || "Top Skills"}
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms Section with required consents */}
      <div className="p-6 rounded-xl border border-border bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-text mb-4">
          {t("auth.signup.sections.agreements") || "Agreements"}
        </h3>
        <div className="space-y-4 text-sm">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded-full border-2 border-border text-primary focus:ring-primary"
              checked={!!formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
            />
            <span className="text-text">
              {t("auth.signup.agreements.terms") || "I agree to the Terms of Service"}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded-full border-2 border-border text-primary focus:ring-primary"
              checked={!!formData.acceptPrivacyPolicy}
              onChange={(e) => setFormData({ ...formData, acceptPrivacyPolicy: e.target.checked })}
            />
            <span className="text-text">
              {t("auth.signup.agreements.privacy") || "I agree to the Privacy Policy"}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded-full border-2 border-border text-primary focus:ring-primary"
              checked={!!formData.acceptMarketingEmails}
              onChange={(e) => setFormData({ ...formData, acceptMarketingEmails: e.target.checked })}
            />
            <span className="text-text">
              {t("auth.signup.agreements.marketing") || "I want to receive updates and offers"}
            </span>
          </label>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-4 bg-success/10 dark:bg-success/20 border border-success/30 rounded-lg">
        <p className="text-success font-medium">
          {t("auth.signup.review.ready") || "You're all set! Click 'Sign Up' to create your account."}
        </p>
      </div>
    </div>
  );
}

interface ReviewFieldProps {
  label: string;
  value: string;
}

function ReviewField({ label, value }: ReviewFieldProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="text-text font-medium text-right">{value}</p>
    </div>
  );
}
