import { Dispatch, SetStateAction } from "react";
import { ProjectFormData } from "../page";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
}

export default function Step2BasicInfo({ formData, setFormData, t }: Props) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold   mb-1">
          {t("createProject.basicInformation")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.basicInfoDesc")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold   mb-2">
          {t("createProject.projectTitle")}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value }))
          }
          placeholder={t("createProject.titlePlaceholder")}
          className="border border-border rounded-lg w-full px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold   mb-2">
          {t("createProject.projectDescription")}
        </label>
        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) =>
            setFormData((p) => ({ ...p, description: e.target.value }))
          }
          placeholder={t("createProject.descriptionPlaceholder")}
          className="border border-border rounded-lg w-full px-3 py-2"
        />
      </div>
    </div>
  );
}
