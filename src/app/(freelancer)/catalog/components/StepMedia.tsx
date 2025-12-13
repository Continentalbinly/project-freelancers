"use client";

import { useRef, useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { CatalogForm } from "./types";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";

export default function StepMedia({ form, setForm }: { form: CatalogForm; setForm: (f: Partial<CatalogForm>) => void }) {
  const { t } = useTranslationContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const MAX_IMAGES = 3;

  const uploadFiles = async (files: FileList | null) => {
    if (!files) return;
    const existing = form.images?.length || 0;
    const remaining = MAX_IMAGES - existing;
    if (remaining <= 0) {
      setError(t("stepMedia.maxImages") || "You can upload up to 3 images. Remove one to add more.");
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);
    setProgress(0);
    setError("");
    const urls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderType", "workSamples");
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`);
        
        const p = new Promise<string>((resolve, reject) => {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                if (json?.success) resolve(json.data.url);
                else reject(new Error(json?.error || "Upload failed"));
              } catch (err) {
                reject(err as any);
              }
            } else reject(new Error(xhr.statusText));
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
        });
        
        xhr.send(formData);
        const url = await p;
        urls.push(url);
      }
      setForm({ images: [...(form.images || []), ...urls] });
      if (files.length > selected.length) {
        setError(t("stepMedia.maxImages") || "Only the first 3 images were added (limit reached).");
      }
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const remove = (u: string) => setForm({ images: (form.images || []).filter((i) => i !== u) });

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-primary" />
          </div>
          {t("stepMedia.serviceImages") || "Service Images"}
        </label>

        <label className="relative block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => uploadFiles(e.target.files)}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t("stepMedia.clickUpload") || "Click to upload images"}</p>
              <p className="text-xs text-text-secondary mt-1">
                {(t("stepMedia.supportedFormats") || "PNG, JPG, WebP up to 10MB") + " · Max 3 images"}
              </p>
            </div>
          </div>
        </label>

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("stepMedia.uploading") || "Uploading..."}
              </span>
              <span className="text-sm font-medium text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-xs text-error">{error}</p>
          </div>
        )}
      </div>

      {(form.images || []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text-primary">
              {t("stepMedia.uploadedImages") || "Uploaded Images"} ({form.images.length})
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {form.images.map((u, idx) => (
              <div
                key={u}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all"
              >
                <img
                  src={u}
                  alt={`Service image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => remove(u)}
                    className="p-2 bg-error rounded-lg text-white hover:bg-error/90 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded-md">
                    {t("stepMedia.cover") || "Cover"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(form.images || []).length === 0 && !uploading && (
        <p className="text-sm text-text-secondary italic text-center py-4">
          {t("stepMedia.noImages") || "No images uploaded yet. Add at least one image to showcase your service."}
        </p>
      )}
    </div>
  );
}
