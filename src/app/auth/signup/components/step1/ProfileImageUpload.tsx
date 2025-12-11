"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface ProfileImageUploadProps {
  formData: SignupCredentials;
  setFormData: Dispatch<SetStateAction<SignupCredentials>>;
  uploading: boolean;
  setUploading: Dispatch<SetStateAction<boolean>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}

export default function ProfileImageUpload({
  formData,
  setFormData,
  uploading,
  setUploading,
  error,
  setError,
}: ProfileImageUploadProps) {
  const { t } = useTranslationContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [lastUploadedAvatarUrl, setLastUploadedAvatarUrl] = useState<
    string | null
  >(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 🔹 Upload to /api/upload */
  const uploadProfileImage = async (file: File) => {
    try {
      if (lastUploadedAvatarUrl) {
        await fetch("/api/delete-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: lastUploadedAvatarUrl }),
        });
        setLastUploadedAvatarUrl(null);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", "profileImage");

      // use XMLHttpRequest to track progress
      const res = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable)
            setProgress(Math.round((event.loaded / event.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(
              new Response(xhr.responseText, {
                status: xhr.status,
                headers: { "Content-Type": "application/json" },
              })
            );
          } else reject(new Error(xhr.statusText));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });

      const result = await res.json();

      if (result.success) {
        setLastUploadedAvatarUrl(result.data.url);
        return {
          success: true,
          url: result.data.url,
          storage: result.data.storage,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to upload image",
        };
      }
    } catch (error: any) {
      return { success: false, error: t("auth.signup.errors.uploadFailed") };
    }
  };

  /** 📸 When a file is chosen */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ accept any image/*
    if (!file.type.startsWith("image/")) {
      setError("Invalid file type. Please select an image file.");
      return;
    }

    // ✅ allow up to 2 GB
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum allowed is 2 GB.");
      return;
    }

    if (lastUploadedAvatarUrl) {
      fetch("/api/delete-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: lastUploadedAvatarUrl }),
      });
      setLastUploadedAvatarUrl(null);
    }

    setSelectedFile(file);
    setError("");
    setProgress(0);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    handleUpload(file);
  };

  /** 🚀 Upload handler */
  const handleUpload = async (file: File) => {
    setUploading(true);
    const result = await uploadProfileImage(file);
    if (result.success) {
      setFormData((prev) => ({ ...prev, avatarUrl: result.url }));
    } else {
      setError(result.error || t("auth.signup.errors.uploadFailed"));
    }
    setUploading(false);
  };

  /** ❌ Remove selected image */
  const removeSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setProgress(0);

    if (lastUploadedAvatarUrl) {
      fetch("/api/delete-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: lastUploadedAvatarUrl }),
      });
      setLastUploadedAvatarUrl(null);
    }

    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="block text-sm font-semibold   mb-3 sm:mb-4">
        {t("auth.signup.step1.profilePicture")}
      </label>

      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
            selectedFile
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5 bg-background"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            tabIndex={-1}
          />

          {!previewUrl ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="btn btn-primary text-sm sm:text-base"
                >
                  {t("auth.signup.step1.chooseImage")}
                </button>
                <p className="text-xs sm:text-sm text-text-muted mt-2">
                  {t("auth.signup.step1.imageHint")}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden border-4 border-border shadow-lg">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {uploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {progress}%
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium   truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={handleFileButtonClick}
                      className="text-sm text-primary hover:text-primary-hover font-medium"
                    >
                      {t("auth.signup.step1.change")}
                    </button>
                    <span className="text-text-muted">•</span>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="text-sm text-error hover:text-error/80 font-medium"
                    >
                      {t("auth.signup.step1.remove")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-error bg-error/10 p-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
