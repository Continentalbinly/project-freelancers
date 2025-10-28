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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

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
    } catch (error) {
      return { success: false, error: t("auth.signup.errors.uploadFailed") };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("File size too large. Maximum size is 5MB.");
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

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Auto-upload the image
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const uploadResult = await uploadProfileImage(file);

    if (uploadResult.success) {
      setFormData((prev) => ({ ...prev, avatarUrl: uploadResult.url }));
    } else {
      setError(uploadResult.error || t("auth.signup.errors.uploadFailed"));
    }

    setUploading(false);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3 sm:mb-4">
        {t("auth.signup.step1.profilePicture")}
      </label>
      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${
            selectedFile
              ? "border-primary bg-primary-light/10"
              : "border-border hover:border-primary/50 hover:bg-primary-light/5"
          }`}
        >
          <input
            suppressHydrationWarning
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            tabIndex={-1}
          />

          {!previewUrl ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-text-muted"
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
                  suppressHydrationWarning
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mx-auto border-2 sm:border-4 border-white shadow-lg flex-shrink-0 aspect-square">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary truncate">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-text-muted">
                  {selectedFile?.size
                    ? (selectedFile.size / 1024 / 1024).toFixed(2)
                    : "0"}{" "}
                  MB
                </p>
                <div className="flex justify-center space-x-2">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={handleFileButtonClick}
                    className="text-sm text-primary hover:text-primary-hover font-medium"
                  >
                    {t("auth.signup.step1.change")}
                  </button>
                  <span className="text-text-muted">•</span>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={removeSelectedFile}
                    className="text-sm text-error hover:text-error/80 font-medium"
                  >
                    {t("auth.signup.step1.remove")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="flex items-center justify-center space-x-3 p-3 sm:p-4 bg-primary-light/20 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
            <span className="text-sm font-medium text-primary">
              {t("auth.signup.step1.uploading")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
