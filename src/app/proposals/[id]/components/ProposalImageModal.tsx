"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export default function ProposalImageModal({
  selectedImage,
  setSelectedImage,
}: any) {
  if (!selectedImage) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {/* Responsive image container */}
          <div className="overflow-hidden rounded-lg bg-black/10 shadow-lg">
            <img
              src={selectedImage}
              alt="Work Sample"
              className="
                w-auto h-auto 
                max-w-[90vw] max-h-[80vh] 
                object-contain 
                rounded-lg 
                transition-transform duration-300 
                hover:scale-[1.02]
              "
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
