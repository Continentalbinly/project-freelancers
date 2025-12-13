"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Send, Loader2, Clock, File } from "lucide-react";
import { submitForReview } from "./actions";
import {
  addDoc,
  collection,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { UserRole } from "./utils";
import { toast } from "react-toastify";

export default function StepInProgress({
  project,
  role,
}: {
  project: any;
  role: UserRole;
}) {
  const { user } = useAuth();
  const { t } = useTranslationContext();

  const isFreelancer = user?.uid === project.acceptedFreelancerId;
  const isClient = user?.uid === project.clientId;

  const [note, setNote] = useState("");
  const [previewFiles, setPreviewFiles] = useState<
    { url: string; name: string }[]
  >([]);
  const [originalFiles, setOriginalFiles] = useState<
    { url: string; name: string }[]
  >([]);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingOriginal, setUploadingOriginal] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [originalProgress, setOriginalProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const previewRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLInputElement>(null);

  /** 🔹 Upload a file via /api/upload */
  const uploadToServer = async (
    file: File,
    folderType: string,
    onProgress: (p: number) => void
  ): Promise<{ url: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderType", folderType);
      formData.append("subfolder", project.id);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success && result.data?.url) {
              resolve({
                url: result.data.url,
                name: result.data.fileName || file.name,
              });
            } else reject(new Error(result.error || "Upload failed"));
          } catch {
            reject(new Error("Invalid JSON response"));
          }
        } else reject(new Error(`HTTP ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });
  };

  /** 🔹 Upload preview (now accepts ALL file types, not just image) */
  const handlePreviewUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPreview(true);
    try {
      const uploads = await Promise.all(
        files.map((f) =>
          uploadToServer(f, "previews", (p) => setPreviewProgress(p))
        )
      );
      setPreviewFiles((prev) => [...prev, ...uploads]);
    } catch (err) {
      toast.error(t("myProjects.stepper.step2.uploadError"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setUploadingPreview(false);
      setPreviewProgress(0);
    }
  };

  /** 🔹 Upload original files (any type, large allowed up to 2 GB) */
  const handleOriginalUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingOriginal(true);
    try {
      const uploads = await Promise.all(
        files.map((f) =>
          uploadToServer(f, "projectFiles", (p) => setOriginalProgress(p))
        )
      );
      setOriginalFiles((prev) => [...prev, ...uploads]);
    } catch (err) {
      toast.error(t("myProjects.stepper.step2.uploadError"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setUploadingOriginal(false);
      setOriginalProgress(0);
    }
  };

  /** 🔹 Submit previews + originals */
  const handleSubmit = async () => {
    if (!previewFiles.length || !originalFiles.length) {
      toast.warn("⚠️ Please upload both preview and original files first.", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
      });
      return;
    }

    setSaving(true);
    try {
      // 1️⃣ Save previews (for review)
      await submitForReview(
        project.id,
        user!.uid,
        previewFiles.map((x) => x.url),
        note
      );

      // 2️⃣ Replace old originals before saving new ones
      const deliverablesRef = collection(
        db,
        "projects",
        project.id,
        "finalDeliverables"
      );
      const existingDocsSnap = await getDocs(deliverablesRef);
      if (!existingDocsSnap.empty) {
        const batch = writeBatch(db);
        existingDocsSnap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }

      // 3️⃣ Add new originals
      for (const file of originalFiles) {
        await addDoc(deliverablesRef, {
          freelancerId: user?.uid,
          fileUrl: file.url,
          fileName: file.name,
          uploadedAt: serverTimestamp(),
        });
      }

      toast.success(t("myProjects.stepper.step2.uploadSuccess"), {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      window.location.reload();
    } catch (err) {
      toast.error(t("myProjects.stepper.step2.uploadError"), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setSaving(false);
    }
  };

  /** 🔹 Client view */
  if (isClient) {
    return (
      <div className="text-center py-12 px-4 sm:px-8">
        <Clock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {t("myProjects.stepper.step2.clientWaitingTitle")}
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          {t("myProjects.stepper.step2.clientWaitingDesc")}
        </p>
      </div>
    );
  }

  /** 🔹 Freelancer view */
  if (!isFreelancer) return null;

  return (
    <div className="py-10 px-4 sm:px-8 max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {t("myProjects.stepper.step2.title")}
      </h2>
      <p className="text-gray-500 mb-8">{t("myProjects.stepper.step2.desc")}</p>

      {/* 🧩 Preview Section */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {t("myProjects.stepper.step2.previewSectionTitle")}
          <span className="text-red-500 ml-1">*</span>
        </h3>

        <div
          className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50 hover:bg-blue-100 cursor-pointer transition"
          onClick={() => previewRef.current?.click()}
        >
          <input
            type="file"
            ref={previewRef}
            className="hidden"
            multiple
            accept="*/*" // ✅ accept all file types
            onChange={handlePreviewUpload}
          />
          {uploadingPreview ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          ) : (
            <Upload className="w-10 h-10 text-blue-500 mx-auto" />
          )}
          <p className="text-sm text-gray-600 mt-2">
            {uploadingPreview
              ? `${t("myProjects.stepper.step2.uploading")} ${previewProgress}%`
              : t("myProjects.stepper.step2.uploadBtn")}
          </p>
        </div>

        {/* Show uploaded previews */}
        <AnimatePresence>
          <motion.div
            layout
            className="flex flex-wrap justify-center gap-3 mt-4"
          >
            {previewFiles.map((file) => (
              <motion.div
                key={file.url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-28 h-28 border rounded-lg overflow-hidden shadow-sm"
              >
                {file.url.match(/\.(jpg|jpeg|png|webp|gif|avif|heic)$/i) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <File className="w-8 h-8" />
                    <p className="text-xs mt-1 text-center px-1 break-words">
                      {file.name}
                    </p>
                  </div>
                )}
                <button
                  onClick={() =>
                    setPreviewFiles(
                      previewFiles.filter((x) => x.url !== file.url)
                    )
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 🧩 Original Files Section */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {t("myProjects.stepper.step2.finalSectionTitle")}
          <span className="text-red-500 ml-1">*</span>
        </h3>

        <div
          className="border-2 border-dashed border-green-300 rounded-2xl p-6 bg-green-50 hover:bg-green-100 cursor-pointer transition"
          onClick={() => originalRef.current?.click()}
        >
          <input
            type="file"
            ref={originalRef}
            className="hidden"
            multiple
            accept="*/*" // ✅ allow all file types
            onChange={handleOriginalUpload}
          />
          {uploadingOriginal ? (
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto" />
          ) : (
            <File className="w-10 h-10 text-green-500 mx-auto" />
          )}
          <p className="text-sm text-gray-600 mt-2">
            {uploadingOriginal
              ? `${t(
                  "myProjects.stepper.step2.uploading"
                )} ${originalProgress}%`
              : t("myProjects.stepper.step2.finalSectionDesc")}
          </p>
        </div>

        {originalFiles.length > 0 && (
          <ul className="mt-3 text-sm text-left text-gray-700 space-y-1">
            {originalFiles.map((file, i) => (
              <li
                key={i}
                className="flex items-center gap-2 justify-center flex-wrap"
              >
                <File className="text-green-600 w-4 h-4" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🧾 Note + Submit */}
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("myProjects.stepper.step2.notePlaceholder")}
        className="w-full border border-gray-300 rounded-lg p-3 mb-6 text-sm focus:ring-2 focus:ring-blue-400"
      />

      <button
        onClick={handleSubmit}
        disabled={saving || uploadingPreview || uploadingOriginal}
        className={`flex items-center justify-center gap-2 px-5 py-3 font-semibold rounded-lg text-white mx-auto ${
          saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("myProjects.stepper.step2.submitting")}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {t("myProjects.stepper.step2.submitBtn")}
          </>
        )}
      </button>
    </div>
  );
}
