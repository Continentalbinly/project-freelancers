"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Upload, Image as ImageIcon, Video, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface UploadedFile {
  url: string;
  type: "image" | "video";
  fileName: string;
}

interface PortfolioMultipleUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export default function PortfolioMultipleUpload({
  onUploadComplete,
  disabled = false,
}: PortfolioMultipleUploadProps) {
  const { t } = useTranslationContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSizeImage = 10 * 1024 * 1024; // 10MB for images
    const maxSizeVideo = 500 * 1024 * 1024; // 500MB for videos
    
    if (file.type.startsWith("image/")) {
      if (file.size > maxSizeImage) {
        return t("profile.portfolio.upload.imageTooLarge") || "Image must be smaller than 10MB";
      }
    } else if (file.type.startsWith("video/")) {
      if (file.size > maxSizeVideo) {
        return t("profile.portfolio.upload.videoTooLarge") || "Video must be smaller than 500MB";
      }
    } else {
      return t("profile.portfolio.upload.invalidFile") || "Please select an image or video file";
    }
    return null;
  };

  // Upload single file
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadingFiles(prev => new Set(prev).add(fileId));
    setProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", "portfolio");
      formData.append("subfolder", file.type.startsWith("image/") ? "image" : "video");

      const uploadKey = process.env.NEXT_PUBLIC_UPLOAD_KEY || "my_secure_upload_token";
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(prev => ({ ...prev, [fileId]: percent }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data?.url) {
                resolve(response.data.url);
              } else {
                reject(new Error(response.error || "Upload failed"));
              }
            } catch  {
              reject(new Error("Failed to parse response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${uploadKey}`);
        xhr.send(formData);
      });

      const url = await uploadPromise;
      const uploadedFile: UploadedFile = {
        url,
        type: file.type.startsWith("image/") ? "image" : "video",
        fileName: file.name,
      };

      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      setProgress(prev => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });

      return uploadedFile;
    } catch (err: unknown) {
      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      setProgress(prev => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
      throw err;
    }
  };

  // Handle multiple file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate all files first
    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    try {
      // Upload files sequentially to avoid overwhelming the server
      const uploaded: UploadedFile[] = [];
      for (const file of validFiles) {
        try {
          const result = await uploadFile(file);
          uploaded.push(result);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : "Upload failed";
          errors.push(`${file.name}: ${errorMessage}`);
        }
      }

      // Update state once with all uploaded files (useEffect will notify parent)
      if (uploaded.length > 0) {
        setUploadedFiles(prev => [...prev, ...uploaded]);
      }

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t("profile.portfolio.upload.failed") || "Upload failed. Please try again.";
      setError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Create a fake event to reuse handleFileSelect logic
    const fakeEvent = {
      target: { files },
    } as React.ChangeEvent<HTMLInputElement>;
    await handleFileSelect(fakeEvent);
  }, [disabled, uploading]);

  // Remove file
  const handleRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Notify parent when uploadedFiles changes (using useEffect to avoid setState during render)
  // Use ref to store the latest callback to avoid dependency issues
  const onUploadCompleteRef = useRef(onUploadComplete);
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  useEffect(() => {
    // Use setTimeout to ensure this runs after state updates are complete
    const timeoutId = setTimeout(() => {
      onUploadCompleteRef.current(uploadedFiles);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [uploadedFiles]);

  const acceptTypes = "image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo";
  const totalProgress = Object.values(progress).length > 0
    ? Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / Object.values(progress).length)
    : 0;

  return (
    <div className="space-y-4">
      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        multiple
        className="hidden"
      />

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${disabled || uploading
            ? "border-border bg-background-secondary cursor-not-allowed opacity-50"
            : isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary bg-background-secondary hover:bg-primary/5"
          }
        `}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="inline-block">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {t("common.uploading") || "Uploading..."} {uploadingFiles.size} {uploadingFiles.size === 1 ? "file" : "files"}
              </p>
              <div className="w-full max-w-xs mx-auto h-2 bg-background-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary">{totalProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center transition-all
                ${isDragging 
                  ? "bg-primary/20 scale-110" 
                  : "bg-linear-to-br from-primary/10 to-secondary/10"
                }
              `}>
                <Upload className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                {t("profile.portfolio.upload.clickToUploadMultiple") || "Click to upload images & videos"}
              </p>
              <p className="text-xs text-text-secondary">
                {t("common.or") || "or"}{" "}
                <span className="text-primary font-medium">
                  {t("common.dragAndDrop") || "drag and drop"}
                </span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                JPG, PNG, GIF, WebP
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                MP4, WebM, MOV
              </span>
              <span>•</span>
              <span>{t("profile.portfolio.upload.maxSize") || "Max"} 10MB / 500MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded files preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">
            {t("profile.portfolio.upload.uploadedFiles") || "Uploaded Files"} ({uploadedFiles.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border bg-background-secondary"
              >
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={file.url}
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 z-10">
                    <CheckCircle2 className="w-3 h-3" />
                    {t("profile.portfolio.cover") || "Cover"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1.5 bg-error/90 hover:bg-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <p className="text-sm text-error whitespace-pre-line">{error}</p>
        </div>
      )}
    </div>
  );
}

