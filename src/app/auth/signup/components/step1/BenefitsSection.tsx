import { useTranslationContext } from "@/app/components/LanguageProvider";

interface BenefitsSectionProps {
  userRoles: ("freelancer" | "client" | "admin")[];
}

export default function BenefitsSection({ userRoles }: BenefitsSectionProps) {
  const { t } = useTranslationContext();

  if (userRoles.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary/15 to-secondary/15 rounded-xl p-4 sm:p-6 border border-border">
      <h3 className="font-semibold text-primary mb-3 sm:mb-4 text-base sm:text-lg">
        {userRoles.length === 1
          ? userRoles[0] === "freelancer"
            ? t("auth.signup.step1.benefits.freelancer.title")
            : t("auth.signup.step1.benefits.client.title")
          : t("auth.signup.step1.benefits.dual.title")}
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {userRoles.includes("freelancer") && (
          <div className="space-y-2">
            <h4 className="font-medium  ">
              {t("auth.signup.step1.benefits.freelancer.subtitle")}
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• {t("auth.signup.step1.benefits.freelancer.items.0")}</li>
              <li>• {t("auth.signup.step1.benefits.freelancer.items.1")}</li>
              <li>• {t("auth.signup.step1.benefits.freelancer.items.2")}</li>
              <li>• {t("auth.signup.step1.benefits.freelancer.items.3")}</li>
            </ul>
          </div>
        )}
        {userRoles.includes("client") && (
          <div className="space-y-2">
            <h4 className="font-medium  ">
              {t("auth.signup.step1.benefits.client.subtitle")}
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• {t("auth.signup.step1.benefits.client.items.0")}</li>
              <li>• {t("auth.signup.step1.benefits.client.items.1")}</li>
              <li>• {t("auth.signup.step1.benefits.client.items.2")}</li>
              <li>• {t("auth.signup.step1.benefits.client.items.3")}</li>
            </ul>
          </div>
        )}
        {userRoles.length > 1 && (
          <div className="space-y-2">
            <h4 className="font-medium  ">
              {t("auth.signup.step1.benefits.dual.subtitle")}
            </h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• {t("auth.signup.step1.benefits.dual.items.0")}</li>
              <li>• {t("auth.signup.step1.benefits.dual.items.1")}</li>
              <li>• {t("auth.signup.step1.benefits.dual.items.2")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
