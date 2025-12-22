"use client";

import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { SignupCredentials } from "@/types/auth";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ReviewStepProps {
  formData: SignupCredentials;
  setFormData: (data: SignupCredentials) => void;
}

export default function ReviewStep({ formData, setFormData }: ReviewStepProps) {
  const { t, currentLanguage } = useTranslationContext();

  const getRoleLabel = () => {
    return formData.role === "freelancer"
      ? t("auth.signup.roles.freelancer.title") || "Freelancer"
      : t("auth.signup.roles.client.title") || "Client";
  };

  const getOccupationLabel = () => {
    const occ = formData.occupation;
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
    // Use currentLanguage from context (should be "en" or "lo")
    return currentLanguage?.startsWith("lo") ? occ.name_lo : occ.name_en;
  };

  const getGenderLabel = () => {
    if (!formData.gender) return "";
    const map: Record<string, string> = {
      male: t("auth.signup.gender.male") || "Male",
      female: t("auth.signup.gender.female") || "Female",
      other: t("auth.signup.gender.other") || "Other",
      prefer_not_to_say: t("auth.signup.gender.preferNotToSay") || "Prefer not to say",
    };
    return map[formData.gender] || formData.gender;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          {t("auth.signup.steps.review.title") || "Review your information"}
        </h2>
        <p className="text-text-secondary">
          {t("auth.signup.steps.review.subtitle") ||
            "Make sure everything is correct before creating your account"}
        </p>
      </div>

      {/* Profile Header Card with Avatar */}
      <div className="p-6 sm:p-8 rounded-xl border-2 border-border bg-background dark:bg-background-secondary shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {formData.avatarUrl ? (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg ring-4 ring-primary/20">
                <Image
                  src={formData.avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-primary/50" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-text mb-1">
              {formData.fullName}
            </h3>
            <p className="text-text-secondary mb-3 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4" />
              {formData.email}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              {getRoleLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-background dark:bg-background-secondary shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text">
            {t("auth.signup.sections.account") || "Account Information"}
          </h3>
        </div>
        <div className="space-y-4">
          <ReviewField
            icon={<User className="w-4 h-4" />}
            label={t("auth.signup.fields.fullName") || "Full Name"}
            value={formData.fullName}
          />
          <ReviewField
            icon={<Mail className="w-4 h-4" />}
            label={t("auth.signup.fields.email") || "Email Address"}
            value={formData.email}
          />
          <ReviewField
            icon={<Briefcase className="w-4 h-4" />}
            label={t("auth.signup.fields.accountType") || "Account Type"}
            value={getRoleLabel()}
          />
        </div>
      </div>

      {/* Profile Information */}
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-background dark:bg-background-secondary shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text">
            {t("auth.signup.sections.profile") || "Profile Information"}
          </h3>
        </div>
        <div className="space-y-4">
          {formData.occupation && (
            <ReviewField
              icon={<Briefcase className="w-4 h-4" />}
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
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-text-secondary" />
                <p className="text-sm font-medium text-text-secondary">
                  {formData.role === "freelancer"
                    ? t("auth.signup.fields.bio.freelancer") || "About you"
                    : t("auth.signup.fields.bio.client") || "About your company"}
                </p>
              </div>
              <p className="text-text whitespace-pre-wrap pl-6 bg-background-secondary dark:bg-background/50 p-3 rounded-lg border border-border dark:border-border/50">
                {formData.bio}
              </p>
            </div>
          )}

          {formData.skills && formData.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {t("auth.signup.fields.skills") || "Top Skills"}
              </p>
              <div className="flex flex-wrap gap-2 pl-6">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personal Information */}
          {(formData.dateOfBirth ||
            formData.gender ||
            formData.phone ||
            formData.country ||
            formData.city ||
            formData.location ||
            formData.website) && (
            <div className="pt-4 border-t border-border dark:border-border/50">
              <p className="text-sm font-semibold text-text-secondary mb-4">
                {t("auth.signup.sections.personal") || "Personal Information"}
              </p>
              <div className="space-y-3 pl-6">
                {formData.dateOfBirth && (
                  <ReviewField
                    icon={<Calendar className="w-4 h-4" />}
                    label={t("auth.signup.fields.dateOfBirth") || "Date of Birth"}
                    value={formatDate(formData.dateOfBirth)}
                  />
                )}
                {formData.gender && (
                  <ReviewField
                    icon={<User className="w-4 h-4" />}
                    label={t("auth.signup.fields.gender") || "Gender"}
                    value={getGenderLabel()}
                  />
                )}
                {formData.phone && (
                  <ReviewField
                    icon={<Phone className="w-4 h-4" />}
                    label={t("auth.signup.fields.phone") || "Phone Number"}
                    value={formData.phone}
                  />
                )}
                {(formData.country || formData.city || formData.location) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-text-secondary" />
                      <p className="text-sm font-medium text-text-secondary">
                        {t("auth.signup.fields.location") || "Location"}
                      </p>
                    </div>
                    <p className="text-text pl-6">
                      {[formData.location, formData.city, formData.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                )}
                {formData.website && (
                  <ReviewField
                    icon={<Globe className="w-4 h-4" />}
                    label={t("auth.signup.fields.website") || "Website"}
                    value={
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {formData.website}
                      </a>
                    }
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms Section */}
      <div className="p-6 sm:p-8 rounded-xl border-2 border-border bg-background dark:bg-background-secondary shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text">
            {t("auth.signup.sections.agreements") || "Agreements"}
          </h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg hover:bg-background-secondary dark:hover:bg-background/50 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              checked={!!formData.acceptTerms}
              onChange={(e) =>
                setFormData({ ...formData, acceptTerms: e.target.checked })
              }
            />
            <div className="flex-1">
              <span className="text-text font-medium">
                {t("auth.signup.agreements.terms") ||
                  "I agree to the Terms of Service"}
              </span>
              {!formData.acceptTerms && (
                <p className="text-xs text-error mt-1">
                  {t("auth.signup.agreements.required") || "Required"}
                </p>
              )}
            </div>
            {formData.acceptTerms ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-error/50 shrink-0" />
            )}
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg hover:bg-background-secondary dark:hover:bg-background/50 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              checked={!!formData.acceptPrivacyPolicy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptPrivacyPolicy: e.target.checked,
                })
              }
            />
            <div className="flex-1">
              <span className="text-text font-medium">
                {t("auth.signup.agreements.privacy") ||
                  "I agree to the Privacy Policy"}
              </span>
              {!formData.acceptPrivacyPolicy && (
                <p className="text-xs text-error mt-1">
                  {t("auth.signup.agreements.required") || "Required"}
                </p>
              )}
            </div>
            {formData.acceptPrivacyPolicy ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-error/50 shrink-0" />
            )}
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg hover:bg-background-secondary dark:hover:bg-background/50 transition-colors">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              checked={!!formData.acceptMarketingEmails}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptMarketingEmails: e.target.checked,
                })
              }
            />
            <div className="flex-1">
              <span className="text-text font-medium">
                {t("auth.signup.agreements.marketing") ||
                  "I want to receive updates and offers"}
              </span>
              <p className="text-xs text-text-secondary mt-1">
                {t("auth.signup.agreements.optional") || "Optional"}
              </p>
            </div>
            {formData.acceptMarketingEmails ? (
              <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            ) : (
              <div className="w-5 h-5 shrink-0" />
            )}
          </label>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-4 sm:p-6 bg-success/10 dark:bg-success/20 dark:border-success/40 border-2 border-success/30 rounded-xl">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-success font-semibold mb-1">
              {t("auth.signup.review.ready") ||
                "You're all set!"}
            </p>
            <p className="text-success/80 text-sm">
              {t("auth.signup.review.readySubtitle") ||
                "Click 'Sign Up' to create your account."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewFieldProps {
  icon?: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

function ReviewField({ icon, label, value }: ReviewFieldProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="text-text-secondary mt-0.5 shrink-0">{icon}</div>
      )}
      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <div className="text-text font-medium text-right sm:text-left sm:max-w-[60%] wrap-break-word">
          {typeof value === "string" ? value : value}
        </div>
      </div>
    </div>
  );
}
