"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Camera, X, Pencil } from "lucide-react";

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
      formData.append("folderType", "profileImage");

      // Get upload key from environment variable
      const uploadKey = process.env.NEXT_PUBLIC_UPLOAD_KEY || "my_secure_upload_token";
      
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${uploadKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      if (!data.success || !data.data?.url) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.data.url);
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
      <label className="block text-sm font-medium text-text mb-3">
        {label}
      </label>

      {value ? (
        <div className="flex flex-col items-center space-y-4">
          {/* Circular Avatar Preview */}
          <div className="relative group">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary shadow-lg ring-4 ring-primary/20">
              <Image
                src={value}
                alt="Profile preview"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, 160px"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors disabled:opacity-50"
                  title={t("common.change") || "Change photo"}
                >
                  <Pencil className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:bg-error/90 transition-colors disabled:opacity-50 z-10"
              title={t("common.remove") || "Remove"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Change/Remove buttons for mobile */}
          <div className="flex gap-2 w-full sm:hidden">
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-primary border-2 border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              {t("common.change") || "Change"}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-error border-2 border-error/30 hover:bg-error/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {t("common.remove") || "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors ${
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
            <div className="space-y-3">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
              <p className="text-sm font-medium text-text">
                {t("common.uploading") || "Uploading..."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl justify-center flex text-primary">
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

      {localError && (
        <div className="mt-3 p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{localError}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-text-secondary text-center">
        {t("auth.signup.upload.optional") ||
          "Optional - You can add a photo later"}
      </p>
    </div>
  );
}
