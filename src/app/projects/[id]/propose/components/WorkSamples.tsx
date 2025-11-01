"use client";

import { useRef, useState } from "react";
import {
  PaperClipIcon,
  XMarkIcon,
  ArrowUpTrayIcon, // ✅ <-- use this instead of CloudUpload
} from "@heroicons/react/24/outline";

interface WorkSamplesProps {
  t: (key: string) => string;
  workSamples: any[];
  setWorkSamples: (samples: any[]) => void;
}

export default function WorkSamples({
  t,
  workSamples,
  setWorkSamples,
}: WorkSamplesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [progress, setProgress] = useState(0);

  // 🖼️ Accept only images
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(
        t("proposePage.onlyImagesAllowed") || "Only image files are allowed"
      );
      return;
    }

    setUploadError("");
    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Upload failed");

      setProgress(70);
      const data = await response.json();
      setProgress(100);

      const newSample = {
        id: Date.now().toString(),
        url: data.secure_url,
        type: "image",
        title: file.name,
        publicId: data.public_id,
      };

      setWorkSamples([...workSamples, newSample]);
      console.log("✅ Uploaded to Cloudinary:", data.secure_url);
    } catch (err) {
      console.error("❌ Cloudinary upload error:", err);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) for (const f of Array.from(files)) handleFileSelect(f);
  };

  const removeSample = (id: string) => {
    setWorkSamples(workSamples.filter((s) => s.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {t("proposePage.workSamplesLabel")}
      </label>

      {/* Upload Box */}
      <label
        htmlFor="fileUpload"
        className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background-secondary"
      >
        <ArrowUpTrayIcon className="w-8 h-8 text-text-secondary mx-auto mb-2" />
        <span className="text-sm text-text-secondary">
          {t("proposePage.workSamplesUploadHint")}
        </span>
        <input
          id="fileUpload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          multiple
        />
      </label>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {t("proposePage.uploading")}... {progress}%
          </p>
        </div>
      )}

      {/* Error */}
      {uploadError && <p className="text-xs text-error mt-2">{uploadError}</p>}

      {/* Uploaded Samples */}
      <div className="flex flex-wrap gap-3 mt-4">
        {workSamples.map((sample) => (
          <div
            key={sample.id}
            className="flex items-center gap-2 bg-background-secondary rounded-lg px-3 py-2 border border-border"
          >
            <img
              src={sample.url}
              alt={sample.title}
              className="w-10 h-10 object-cover rounded border border-border"
            />
            <span className="text-xs font-medium truncate max-w-[100px]">
              {sample.title}
            </span>
            <button
              type="button"
              onClick={() => removeSample(sample.id)}
              className="text-error hover:text-error/80"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
