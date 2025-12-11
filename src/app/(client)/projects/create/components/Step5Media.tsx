"use client";

import { useState, Dispatch, RefObject, SetStateAction } from "react";
import { ProjectFormData } from "../page";
import imageCompression from "browser-image-compression";

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
  const [uploadingSample, setUploadingSample] = useState(false);

  // ----------------------------------------------------
  // 🔥 Helper: Compress image before uploading
  // ----------------------------------------------------
  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1500,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  // ----------------------------------------------------
  // 🔥 Upload to Cloudinary (shared)
  // ----------------------------------------------------
  const uploadToCloudinary = async (file: File, type: "banner" | "sample") => {
    try {
      setUploading(true);
      setUploadProgress(10);

      const compressed = await compressImage(file);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !preset) throw new Error("Missing Cloudinary config");

      const body = new FormData();
      body.append("file", compressed);
      body.append("upload_preset", preset);

      // Show progress simulation
      let progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 95));
      }, 200);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body }
      );

      clearInterval(progressInterval);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      // Store uploaded URL
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
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  // ----------------------------------------------------
  // 🔥 Banner Select
  // ----------------------------------------------------
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    await uploadToCloudinary(file, "banner");
  };

  // ----------------------------------------------------
  // 🔥 Sample Images Select (supports multi-select)
  // ----------------------------------------------------
  const handleSampleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingSample(true);

    for (const f of files) {
      await uploadToCloudinary(f, "sample");
    }

    setUploadingSample(false);
  };

  // ----------------------------------------------------
  // 🔥 Remove a sample
  // ----------------------------------------------------
  const removeSample = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      sampleImages: prev.sampleImages?.filter((img) => img !== url),
    }));
  };

  // ----------------------------------------------------
  // 🔥 Drag & Drop handling
  // ----------------------------------------------------
  const handleDropBanner = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    await uploadToCloudinary(file, "banner");
  };

  const handleDropSample = async (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;

    setUploadingSample(true);
    for (const file of files) {
      await uploadToCloudinary(file, "sample");
    }
    setUploadingSample(false);
  };

  return (
    <div className="space-y-8 text-center">
      <h2 className="text-xl font-semibold  ">
        {t("createProject.projectMedia")}
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        {t("createProject.mediaDesc")}
      </p>

      {/* ----------------------------------------------------
         📌 BANNER UPLOAD (Drag & Drop + Preview)
      ---------------------------------------------------- */}
      <div>
        <h3 className="font-medium   mb-2">
          {t("createProject.bannerImage")}
        </h3>

        {previewUrl ? (
          <div className="flex flex-col items-center">
            <img
              src={previewUrl}
              className="w-72 h-auto rounded-lg border shadow-sm object-cover"
            />

            {!uploading && (
              <button
                className="btn btn-outline mt-3 text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {t("createProject.replaceImage")}
              </button>
            )}
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 transition cursor-pointer"
            onDrop={handleDropBanner}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <p>{t("createProject.dragDropBanner")}</p>
            <p className="text-xs text-text-secondary mt-1">
              {t("createProject.orClickToUpload")}
            </p>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="w-full rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <input
          type="file"
          className="hidden"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleBannerSelect}
        />
      </div>

      {/* ----------------------------------------------------
         📌 SAMPLE IMAGES — Multiple Upload + Drag & Drop
      ---------------------------------------------------- */}
      <div>
        <h3 className="font-medium   mb-2">
          {t("createProject.sampleImages")}
        </h3>

        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 transition cursor-pointer"
          onDrop={handleDropSample}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>{t("createProject.dragDropSamples")}</p>
          <p className="text-xs text-text-secondary mt-1">
            {t("createProject.orClickToUpload")}
          </p>

          <input
            type="file"
            id="sampleUpload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleSampleSelect}
          />

          <button
            className="btn btn-outline mt-4"
            onClick={() => document.getElementById("sampleUpload")?.click()}
          >
            {uploadingSample
              ? t("createProject.uploading")
              : t("createProject.addSampleImage")}
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          {formData.sampleImages?.map((url) => (
            <div key={url} className="relative w-28 h-28">
              <img
                src={url}
                className="w-28 h-28 object-cover rounded-lg border border-border shadow-sm"
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
      </div>
    </div>
  );
}
