"use client";

import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

export default function WorkSamples({ t, workSamples, setWorkSamples }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;
    const newSample = {
      id: Date.now().toString(),
      file,
      type: file.type.startsWith("image/") ? "image" : "file",
      title: file.name,
      previewUrl,
    };
    setWorkSamples([...workSamples, newSample]);
  };

  const removeSample = (id: string) => {
    setWorkSamples(workSamples.filter((s: any) => s.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {t("proposePage.workSamplesLabel")}
      </label>
      <label
        htmlFor="fileUpload"
        className="block border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-background-secondary"
      >
        <PaperClipIcon className="w-8 h-8 text-text-secondary mx-auto mb-2" />
        <span className="text-sm text-text-secondary">
          {t("proposePage.workSamplesUploadHint")}
        </span>
        <input
          id="fileUpload"
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const files = e.target.files;
            if (files) for (const f of Array.from(files)) handleFileSelect(f);
          }}
          className="hidden"
          multiple
        />
      </label>

      <div className="flex flex-wrap gap-3 mt-3">
        {workSamples.map((sample: any) => (
          <div
            key={sample.id}
            className="flex items-center gap-2 bg-background-secondary rounded-lg px-3 py-2"
          >
            {sample.type === "image" ? (
              <img
                src={sample.previewUrl}
                alt={sample.title}
                className="w-10 h-10 object-cover rounded border border-border"
              />
            ) : (
              <PaperClipIcon className="w-5 h-5 text-text-secondary" />
            )}
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
