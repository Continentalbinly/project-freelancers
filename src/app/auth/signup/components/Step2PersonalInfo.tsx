import { Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import BasicPersonalFields from "./step2/BasicPersonalFields";
import FreelancerCategorySelection from "./step2/FreelancerCategorySelection";
import ClientCategorySelection from "./step2/ClientCategorySelection";
import StudentFields from "./step2/StudentFields";
import WorkerFields from "./step2/WorkerFields";
import PureFreelancerFields from "./step2/PureFreelancerFields";

interface Step2PersonalInfoProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
}

export default function Step2PersonalInfo({
  formData,
  setFormData,
}: Step2PersonalInfoProps) {
  const { t } = useTranslationContext();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
          {t("auth.signup.step2.title")}
        </h3>
        <p className="text-text-secondary">{t("auth.signup.step2.subtitle")}</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <BasicPersonalFields formData={formData} handleChange={handleChange} />

        {/* Freelancer Category Selection */}
        {formData.userRoles.includes("freelancer") && (
          <FreelancerCategorySelection
            formData={formData}
            handleChange={handleChange}
          />
        )}

        {/* Client Category Selection */}
        {formData.userRoles.includes("client") && (
          <ClientCategorySelection
            formData={formData}
            handleChange={handleChange}
          />
        )}

        {/* Conditional Fields Based on Category */}

        {/* Pure Freelancer Fields (for freelancer role with freelancer category) */}
        {formData.userRoles.includes("freelancer") &&
          formData.userCategory === "freelancer" && (
            <PureFreelancerFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              colorScheme="primary"
            />
          )}

        {/* Student Fields */}
        {formData.userRoles.includes("freelancer") &&
          formData.userCategory === "student" && (
            <StudentFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />
          )}

        {/* Worker Fields (for freelancer role) */}
        {formData.userRoles.includes("freelancer") &&
          formData.userCategory === "worker" && (
            <WorkerFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              colorScheme="primary"
            />
          )}

        {/* Client Category: Teacher */}
        {formData.userRoles.includes("client") &&
          formData.clientCategory === "teacher" && (
            <WorkerFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              colorScheme="secondary"
              labels={{
                title: t("auth.signup.step2.clientInfo.title"),
                company: t("auth.signup.step2.clientInfo.institution"),
                companyPlaceholder: t(
                  "auth.signup.step2.clientInfo.institutionPlaceholder"
                ),
              }}
            />
          )}

        {/* Client Category: Worker */}
        {formData.userRoles.includes("client") &&
          formData.clientCategory === "worker" && (
            <WorkerFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              colorScheme="secondary"
            />
          )}

        {/* Client Category: Freelancer */}
        {formData.userRoles.includes("client") &&
          formData.clientCategory === "freelancer" && (
            <PureFreelancerFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              colorScheme="secondary"
            />
          )}
      </div>
    </div>
  );
}
