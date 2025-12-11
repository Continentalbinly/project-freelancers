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
      {/* Section title */}
      <div>
        <h2 className="text-xl font-semibold   mb-1">
          {t("createProject.projectTypeVisibility")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.projectTypeDesc")}
        </p>
      </div>

      {/* 💼 Fixed project owner */}
      <div>
        <label className="block text-sm font-medium   mb-2">
          {t("createProject.whoAreYouPosting")}
        </label>
        <div className="p-4 border-2 border-primary bg-primary-light/10 rounded-xl">
          <h3 className="font-semibold capitalize mb-1  ">
            {t("createProject.client")}
          </h3>
          <p className="text-xs text-text-secondary">
            {t("createProject.clientDesc")}
          </p>
        </div>
      </div>

      {/* Max Freelancers */}
      <div>
        <label className="block text-sm font-medium   mb-2">
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
        <label className="block text-sm font-medium   mb-2">
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
              <h3 className="font-semibold   mb-1">
                {t(`createProject.${v}`)}
              </h3>
              <p className="text-xs text-text-secondary">
                {t(`createProject.${v}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ✳️ Edit Quota */}
      <div>
        <label className="block text-sm font-medium   mb-2">
          {t("createProject.editQuota") || "Edit Quota (Revisions)"}
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={formData.editQuota ?? 3}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              editQuota: Number(e.target.value),
            }))
          }
          className="border border-border rounded-lg px-3 py-2 w-40"
        />
        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.editQuotaDesc") ||
            "Number of times client can request revisions (default 3)."}
        </p>
      </div>
    </div>
  );
}
