"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";

export interface ProjectFormData {
  title: string;
  description: string;
  categoryId?: string;
  category?: { id: string; name_en: string; name_lo: string } | null;
  timeline: string;
  skillsRequired: string[];
  imageUrl: string;
  sampleImages?: string[];
  projectType: "client";
  maxFreelancers: number;
  visibility: "public" | "private";
  editQuota?: number;
  budget: number;
  postingFee: number;
}

interface Props {
  formData: ProjectFormData;
  setFormData: Dispatch<SetStateAction<ProjectFormData>>;
  t: (key: string) => string;
  previewUrl: string;
  setPreviewUrl: Dispatch<SetStateAction<string>>;
  uploading: boolean;
}

export default function ProjectMedia({
  formData,
  setFormData,
  t,
  previewUrl,
  setPreviewUrl,
  uploading,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sampleInputRef = useRef<HTMLInputElement>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [samplesUploading, setSamplesUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const isBusy = uploading || bannerUploading || samplesUploading;

  const uploadToApi = (file: File, folderType = "projectImage") =>
    new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", folderType);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      if (process.env.NEXT_PUBLIC_UPLOAD_KEY) {
        xhr.setRequestHeader("Authorization", `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`);
      }

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && json?.success && json?.data?.url) {
            resolve(json.data.url);
          } else {
            reject(new Error(json?.error || xhr.statusText || "Upload failed"));
          }
        } catch  {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setBannerUploading(true);
    try {
      const url = await uploadToApi(file, "projectImage");
      setPreviewUrl(url);
      setFormData((p) => ({ ...p, imageUrl: url }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setUploadError(errorMessage);
    } finally {
      setBannerUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((p) => ({ ...p, imageUrl: "" }));
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSampleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError("");
    setSamplesUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        const url = await uploadToApi(f, "projectSamples");
        urls.push(url);
      }
      setFormData((p) => ({ ...p, sampleImages: [...(p.sampleImages || []), ...urls] }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setUploadError(errorMessage);
    } finally {
      setSamplesUploading(false);
      if (sampleInputRef.current) sampleInputRef.current.value = "";
    }
  };

  const removeSample = (url: string) =>
    setFormData((p) => ({ ...p, sampleImages: (p.sampleImages || []).filter((i) => i !== url) }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {t("createProject.projectMedia")}
        </h2>
        <p className="text-text-secondary text-sm">
          {t("createProject.mediaDesc")}
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t("createProject.bannerImage")}
        </label>

        {previewUrl || formData.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden border-2 border-border mb-3">
            <Image
              src={previewUrl || formData.imageUrl}
              alt="Preview"
              width={800}
              height={256}
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={uploading}
              className="absolute top-3 right-3 p-2 rounded-lg bg-error/20 hover:bg-error/30 text-error transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isBusy}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-text-secondary/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-text-primary mb-1">
              {t("createProject.dragDropBanner") || "Click to upload banner image"}
            </p>
            <p className="text-xs text-text-secondary">
              {t("createProject.supportedFormats")}
            </p>
          </label>
        )}

        {isBusy && (
          <p className="text-xs text-primary mt-2">
            {t("createProject.uploading")}...
          </p>
        )}
      </div>

      {/* Sample Images / Work Samples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-primary">
            {t("createProject.sampleImages") || "Sample Reference Images"}
          </label>
          <p className="text-xs text-text-secondary">
            {t("createProject.supportedFormats")}
          </p>
        </div>

        <label className="block border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
          <input
            ref={sampleInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSampleUpload}
            disabled={isBusy}
            className="hidden"
          />
          <Upload className="w-7 h-7 text-text-secondary/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-text-primary mb-1">
            {t("createProject.dragDropSamples") || "Click to upload sample images"}
          </p>
          <p className="text-xs text-text-secondary">
            {t("createProject.supportedFormats")}
          </p>
        </label>

        {uploadError && <p className="text-xs text-error">{uploadError}</p>}

        {(formData.sampleImages || []).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.sampleImages!.map((url, idx) => (
              <div
                key={url}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all"
              >
                <Image src={url} alt={`Sample ${idx + 1}`} width={400} height={400} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeSample(url)}
                    className="p-2 bg-error text-white rounded-lg hover:bg-error/90 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(formData.sampleImages || []).length === 0 && (
          <p className="text-sm text-text-secondary italic text-center">
            {t("createProject.sampleImagesDesc") || "Add supporting images to help freelancers understand your goal."}
          </p>
        )}
      </div>
    </div>
  );
}
