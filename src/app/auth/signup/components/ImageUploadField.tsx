"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Camera } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  error: string;
  setError: (error: string) => void;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  uploading,
  setUploading,
}: ImageUploadFieldProps) {
  const { t } = useTranslationContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setLocalError(
        t("auth.signup.errors.invalidFileType") || "Please select an image file"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError(
        t("auth.signup.errors.fileTooLarge") || "File must be smaller than 5MB"
      );
      return;
    }

    setLocalError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profileImage");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setLocalError(
        t("auth.signup.errors.uploadFailed") ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text mb-2">
        {label}
      </label>

      {value ? (
        <div className="space-y-3">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary bg-background-secondary">
            <Image
              src={value}
              alt="Profile preview"
              fill
              className="object-cover"
              sizes="100%"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="w-full px-4 py-2 rounded-lg font-medium text-error border border-error/30 hover:bg-error/5 transition-colors disabled:opacity-50"
          >
            {t("common.remove") || "Remove"}
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            uploading
              ? "border-border bg-background-secondary"
              : "border-border hover:border-primary bg-background-secondary hover:bg-primary-light"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-2">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm font-medium text-text">
                {t("common.uploading") || "Uploading..."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl justify-center flex text-primary mb-2">
                <Camera />
              </div>
              <div>
                <p className="text-sm font-medium text-text">
                  {t("common.clickToUpload") || "Click to upload"}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {t("common.or") || "or"}{" "}
                  <span className="text-primary font-medium">
                    {t("common.dragAndDrop") || "drag and drop"}
                  </span>
                </p>
              </div>
              <p className="text-xs text-text-secondary">
                {t("common.imageFormats") || "JPG, PNG or GIF (max 5MB)"}
              </p>
            </div>
          )}
        </div>
      )}

      {localError && <p className="mt-2 text-sm text-error">{localError}</p>}

      <p className="mt-2 text-xs text-text-secondary">
        {t("auth.signup.upload.optional") ||
          "Optional - You can add a photo later"}
      </p>
    </div>
  );
}
