"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImagePreviewModal({
  isOpen,
  images,
  initialIndex,
  onClose,
}: ImagePreviewModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(initialIndex);

  const handleNext = () => {
    if (selectedIdx < images.length - 1) {
      setSelectedIdx(selectedIdx + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIdx > 0) {
      setSelectedIdx(selectedIdx - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="w-full h-full fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[selectedIdx]}
          alt={`Preview ${selectedIdx + 1}`}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />

        {/* Previous Button */}
        {selectedIdx > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {selectedIdx < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-semibold">
          {selectedIdx + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
