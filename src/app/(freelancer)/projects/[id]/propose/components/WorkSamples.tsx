"use client";

import { useRef, useState } from "react";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface WorkSample {
  id: string;
  url: string;
  type: string;
  title: string;
}

interface WorkSamplesProps {
  t: (key: string) => string;
  workSamples: WorkSample[];
  setWorkSamples: React.Dispatch<React.SetStateAction<WorkSample[]>>;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** 🔹 Handle file selection */
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) await handleFileSelect(file);
  };

  /** 🔹 Upload single image */
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError(
        t("proposePage.onlyImagesAllowed") || "Only image files are allowed"
      );
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > MAX_SIZE) {
      setUploadError("Image file too large. Maximum size is 2 GB.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", "workSamples");

      const upload = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
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

      const result = await upload.json();
      if (!result.success) throw new Error(result.error || "Upload failed");

      const newSample: WorkSample = {
        id: Date.now().toString(),
        url: result.data.url,
        type: "image",
        title: file.name,
      };

      setWorkSamples((prev) => [...prev, newSample]);
    } catch {
      //
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  /** 🔹 Remove file (both client + server) */
  const removeSample = async (id: string) => {
    const sample = workSamples.find((s) => s.id === id);
    if (!sample) return;

    const confirmDelete = confirm("Delete this image from server?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await fetch("/api/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`,
        },
        body: JSON.stringify({ url: sample.url }),
      });
    } catch {
      //console.error("⚠️ Delete failed:", err);
    }

    setWorkSamples((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium   mb-2">
        {t("proposePage.workSamplesLabel")}
      </label>

      {/* Upload Box */}
      <label
        htmlFor="fileUpload"
        className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition bg-background-secondary"
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
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </label>

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-3">
          <div className="w-full rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {t("proposePage.uploading")} {progress}%
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
            className="flex items-center gap-2 bg-background-secondary rounded-lg px-3 py-2 border border-border relative"
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
              disabled={deletingId === sample.id}
              onClick={() => removeSample(sample.id)}
              className={`text-error hover:text-error/80 ${
                deletingId === sample.id ? "opacity-50 cursor-wait" : ""
              }`}
            >
              {deletingId === sample.id ? (
                <span className="animate-spin border-2 border-error border-t-transparent rounded-full w-4 h-4 inline-block" />
              ) : (
                <XMarkIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
