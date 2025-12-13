"use client";

import { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

interface GallerySectionProps {
  images: string[];
  t: (key: string) => string;
}

export default function GallerySection({ images, t }: GallerySectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!images || images.length <= 1) return null;

  return (
    <>
      <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
          {t("catalogDetail.gallery")}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setPreviewIndex(idx)}
              className="group relative rounded-xl overflow-hidden border border-border/50 dark:border-border-dark/50 hover:border-primary/50 dark:hover:border-primary-dark/50 transition-all cursor-pointer"
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewIndex !== null && (
        <ImagePreviewModal
          isOpen={true}
          images={images}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
}
