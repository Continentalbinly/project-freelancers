"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function ProposalImageModal({
  selectedImage,
  setSelectedImage,
}: any) {
  if (!selectedImage) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={() => setSelectedImage(null)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        <img
          src={selectedImage}
          alt="Work Sample"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}
