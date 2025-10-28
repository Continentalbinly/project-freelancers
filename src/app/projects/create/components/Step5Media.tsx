import { Dispatch, RefObject, SetStateAction } from "react";
import { ProjectFormData } from "../page";

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
  previewUrl: string;
  setPreviewUrl: Dispatch<SetStateAction<string>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  t: (key: string) => string;
}

export default function Step5Media({
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  fileInputRef,
  t,
}: Props) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t("createProject.projectMedia")}
      </h2>
      <p className="text-text-secondary text-sm">
        {t("createProject.mediaDesc")}
      </p>

      {previewUrl ? (
        <div className="flex flex-col items-center">
          <img
            src={previewUrl}
            alt="preview"
            className="w-64 rounded-lg border"
          />
          <p className="text-xs text-text-secondary mt-2">
            {t("createProject.selected")}
          </p>
        </div>
      ) : (
        <div className="border-dashed border-2 p-6 rounded-lg bg-gray-50">
          <p className="text-text-secondary">
            {t("createProject.noImageSelected")}
          </p>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline mt-4"
          >
            {t("createProject.chooseImage")}
          </button>
        </div>
      )}
    </div>
  );
}
