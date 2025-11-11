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
  const [uploadingSample, setUploadingSample] = useState(false);

  // 🔹 Upload to Cloudinary (shared)
  const uploadToCloudinary = async (file: File, type: "banner" | "sample") => {
    try {
      setUploading(true);
      setUploadProgress(10);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !preset) throw new Error("Missing Cloudinary config");

      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", preset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      if (type === "banner") {
        setFormData((prev) => ({ ...prev, imageUrl: data.secure_url }));
        setPreviewUrl(data.secure_url);
      } else {
        setFormData((prev) => ({
          ...prev,
          sampleImages: [...(prev.sampleImages || []), data.secure_url],
        }));
      }

      setUploadProgress(100);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  // 🔹 Banner select
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    await uploadToCloudinary(file, "banner");
  };

  // 🔹 Sample image upload
  const handleSampleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSample(true);
    await uploadToCloudinary(file, "sample");
    setUploadingSample(false);
  };

  // 🔹 Remove sample
  const removeSample = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      sampleImages: prev.sampleImages?.filter((img) => img !== url),
    }));
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-semibold text-text-primary mb-1">
        {t("createProject.projectMedia")}
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        {t("createProject.mediaDesc")}
      </p>

      {/* ✅ Banner Image */}
      <div className="space-y-4">
        <h3 className="font-medium text-text-primary">
          {t("createProject.bannerImage") || "Main Banner Image"}
        </h3>

        {previewUrl ? (
          <div className="flex flex-col items-center">
            <img
              src={previewUrl}
              alt="Banner preview"
              className="w-64 h-auto rounded-lg border shadow-sm"
            />
            {!uploading && (
              <button
                onClick={() => {
                  setPreviewUrl("");
                  setFormData((prev) => ({ ...prev, imageUrl: "" }));
                  fileInputRef.current?.click();
                }}
                className="btn btn-outline mt-3 text-sm"
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
              onChange={handleBannerSelect}
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

      {/* ✅ Sample Reference Images */}
      <div className="space-y-4">
        <h3 className="font-medium text-text-primary">
          {t("createProject.sampleImages") || "Sample Reference Images"}
        </h3>
        <p className="text-sm text-text-secondary mb-2">
          {t("createProject.sampleImagesDesc") ||
            "Upload extra images that help freelancers understand your goal."}
        </p>

        {/* sample preview */}
        <div className="flex flex-wrap justify-center gap-4">
          {formData.sampleImages?.map((url) => (
            <div key={url} className="relative w-28 h-28">
              <img
                src={url}
                alt="sample"
                className="w-28 h-28 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeSample(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* sample uploader */}
        <div className="mt-3">
          <input
            type="file"
            id="sampleUpload"
            className="hidden"
            accept="image/*"
            onChange={handleSampleSelect}
          />
          <label
            htmlFor="sampleUpload"
            className={`btn btn-outline ${uploadingSample ? "opacity-60" : ""}`}
          >
            {uploadingSample
              ? t("createProject.uploading") || "Uploading..."
              : t("createProject.addSampleImage") || "Add Sample Image"}
          </label>
        </div>
      </div>
    </div>
  );
}
