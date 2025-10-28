import { Dispatch, SetStateAction } from "react";
import { ProjectFormData } from "../page";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
}

export default function Step1ProjectType({ formData, setFormData, t }: Props) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {t("createProject.projectTypeVisibility")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.projectTypeDesc")}
        </p>
      </div>

      {/* Project Type */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t("createProject.whoAreYouPosting")}
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(["client", "freelancer"] as const).map((type) => (
            <div
              key={type}
              onClick={() => setFormData((p) => ({ ...p, projectType: type }))}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.projectType === type
                  ? "border-primary bg-primary-light/10 shadow-sm"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <h3 className="font-semibold capitalize mb-1 text-text-primary">
                {t(`createProject.${type}`)}
              </h3>
              <p className="text-xs text-text-secondary">
                {t(`createProject.${type}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Max Freelancers */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t("createProject.maxFreelancers")}
        </label>
        <input
          type="number"
          min={1}
          value={formData.maxFreelancers}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              maxFreelancers: Number(e.target.value),
            }))
          }
          className="border border-border rounded-lg px-3 py-2 w-40"
        />
        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.maxFreelancersDesc")}
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t("createProject.projectVisibility")}
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(["public", "private"] as const).map((v) => (
            <div
              key={v}
              onClick={() => setFormData((p) => ({ ...p, visibility: v }))}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                formData.visibility === v
                  ? "border-primary bg-primary-light/10 shadow-sm"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <h3 className="font-semibold text-text-primary mb-1">
                {t(`createProject.${v}`)}
              </h3>
              <p className="text-xs text-text-secondary">
                {t(`createProject.${v}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
