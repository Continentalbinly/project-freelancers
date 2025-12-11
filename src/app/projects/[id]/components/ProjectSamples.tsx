"use client";

import { useState } from "react";
import { X } from "lucide-react"; // uses your lucide-react icons

interface ProjectSamplesProps {
  sampleImages: string[];
  t: (key: string) => string;
}

export default function ProjectSamples({
  sampleImages,
  t,
}: ProjectSamplesProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!sampleImages || sampleImages.length === 0) return null;

  return (
    <div className="mt-6">
      {/* 🏷️ Section Title */}
      <h3 className="text-lg font-semibold   mb-3">
        {t("projectDetail.projectSamples") || "Project Samples"}
      </h3>

      {/* 🖼️ Grid of images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sampleImages.map((url, i) => (
          <div
            key={i}
            className="relative w-full aspect-square overflow-hidden rounded-lg border border-border dark:border-gray-800 cursor-pointer"
            onClick={() => setPreviewUrl(url)}
          >
            <img
              src={url}
              alt={`sample-${i}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* 🔍 Modal Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          {/* ✖️ Close button */}
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
          >
            <X className="text-white w-6 h-6" />
          </button>

          {/* 🖼️ Fullscreen image */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={previewUrl}
              alt="preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
