"use client";

import { useState, Dispatch, RefObject, SetStateAction } from "react";
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
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  previewUrl,
  setPreviewUrl,
  fileInputRef,
  t,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadError("");

    // 🔥 Auto-upload to Cloudinary
    await uploadToCloudinary(file);
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(10);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !preset) {
        throw new Error("❌ Missing Cloudinary config. Check .env.local");
      }

      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Cloudinary error response:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      setUploadProgress(100);
      setFormData((prev) => ({ ...prev, imageUrl: data.secure_url }));
      console.log("✅ Uploaded successfully:", data.secure_url);
    } catch (err: any) {
      console.error("❌ Cloudinary upload error:", err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  const handleReplace = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t("createProject.projectMedia")}
      </h2>
      <p className="text-text-secondary text-sm">
        {t("createProject.mediaDesc")}
      </p>

      {/* Preview section */}
      {previewUrl ? (
        <div className="flex flex-col items-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-64 h-auto rounded-lg border shadow-sm"
          />

          {uploading && (
            <div className="w-64 mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {t("createProject.uploading")} ({uploadProgress}%)
              </p>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-error mt-2">{uploadError}</p>
          )}

          {!uploading && (
            <button
              onClick={handleReplace}
              className="btn btn-outline mt-4 text-xs sm:text-sm"
            >
              {t("createProject.replaceImage")}
            </button>
          )}
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
