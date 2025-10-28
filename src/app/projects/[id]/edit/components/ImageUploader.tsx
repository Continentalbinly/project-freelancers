"use client";

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  formData: any;
  setFormData: any;
  deleteProjectImage: (url: string) => Promise<void>;
  t: (key: string) => string;
}

export default function ImageUploader({
  formData,
  setFormData,
  deleteProjectImage,
  t,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState(formData.imageUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError(t("editProject.invalidFileTypeError"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("editProject.fileSizeTooLargeError"));
      return;
    }

    setSelectedFile(file);
    setError("");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedFile = async () => {
    if (previewUrl && !selectedFile) {
      await deleteProjectImage(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    setFormData((p: any) => ({ ...p, imageUrl: "" }));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-text-primary">
        {t("editProject.projectImageOptional")}
      </label>

      {previewUrl ? (
        <div className="space-y-4">
          <div className="relative w-full max-w-md">
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-40 sm:h-56 object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              onClick={removeSelectedFile}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-secondary">
            {selectedFile
              ? `${t("editProject.selected")}: ${selectedFile.name}`
              : t("editProject.currentProjectImage")}
          </p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <PhotoIcon className="w-10 h-10 text-text-secondary mx-auto mb-3" />
          <p className="text-sm text-text-secondary mb-3">
            {t("editProject.noImageSelected")}
          </p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline"
          >
            {t("editProject.chooseImage")}
          </button>
        </div>
      )}

      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
