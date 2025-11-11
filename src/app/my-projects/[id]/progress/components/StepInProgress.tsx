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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [originalFiles, setOriginalFiles] = useState<
    { url: string; name: string }[]
  >([]);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingOriginal, setUploadingOriginal] = useState(false);
  const [saving, setSaving] = useState(false);

  const previewRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLInputElement>(null);

  /** 🔹 Upload to your backend /api/upload route */
  const uploadToServer = async (
    file: File,
    folderType: string
  ): Promise<{ url: string; name: string }> => {
    const body = new FormData();
    body.append("file", file);
    body.append("folderType", folderType);
    body.append("subfolder", project.id);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`,
      },
      body,
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.data?.url) {
      console.error("❌ Upload failed:", data);
      throw new Error(data.error || "Upload failed");
    }

    return { url: data.data.url, name: data.data.fileName || file.name };
  };

  /** 🔹 Upload preview files (images only) */
  const handlePreviewUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPreview(true);
    try {
      const uploads = await Promise.all(
        files.map((f) => uploadToServer(f, "previews"))
      );
      setPreviewUrls((prev) => [...prev, ...uploads.map((u) => u.url)]);
    } catch {
      alert("Error uploading preview files. Please try again.");
    } finally {
      setUploadingPreview(false);
    }
  };

  /** 🔹 Upload original files (any file type, large allowed) */
  const handleOriginalUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingOriginal(true);
    try {
      const uploads = await Promise.all(
        files.map((f) => uploadToServer(f, "projectFiles"))
      );
      setOriginalFiles((prev) => [...prev, ...uploads]);
    } catch {
      alert("Error uploading original files. Please try again.");
    } finally {
      setUploadingOriginal(false);
    }
  };

  /** 🔹 Submit previews + originals */
  const handleSubmit = async () => {
    if (!previewUrls.length && !originalFiles.length) {
      alert(t("myProjects.stepper.step2.uploadPreviewAndOriginal"));
      return;
    }
    if (!previewUrls.length) {
      alert(t("myProjects.stepper.step2.uploadPreviewRequired"));
      return;
    }
    if (!originalFiles.length) {
      alert(t("myProjects.stepper.step2.uploadOriginalRequired"));
      return;
    }

    setSaving(true);
    try {
      // 1️⃣ Save previews (for review)
      await submitForReview(project.id, user!.uid, previewUrls, note);

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

      // 3️⃣ Add the new originals
      for (const file of originalFiles) {
        await addDoc(deliverablesRef, {
          freelancerId: user?.uid,
          fileUrl: file.url,
          fileName: file.name,
          uploadedAt: serverTimestamp(),
        });
      }

      alert("✅ " + t("myProjects.stepper.step2.uploadSuccess"));
      window.location.reload();
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Error while submitting. Please try again.");
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

      {/* 🧩 Preview Files Section */}
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
            accept="image/*"
            onChange={handlePreviewUpload}
          />
          {uploadingPreview ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
          ) : (
            <Upload className="w-10 h-10 text-blue-500 mx-auto" />
          )}
          <p className="text-sm text-gray-600 mt-2">
            {uploadingPreview
              ? t("myProjects.stepper.step2.uploading")
              : t("myProjects.stepper.step2.uploadBtn")}
          </p>
        </div>

        {/* Preview thumbnails */}
        <AnimatePresence>
          <motion.div
            layout
            className="flex flex-wrap justify-center gap-3 mt-4"
          >
            {previewUrls.map((url) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-28 h-28 rounded-lg overflow-hidden border shadow-sm"
              >
                <img
                  src={url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() =>
                    setPreviewUrls(previewUrls.filter((x) => x !== url))
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
            accept="*/*"
            onChange={handleOriginalUpload}
          />
          {uploadingOriginal ? (
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto" />
          ) : (
            <File className="w-10 h-10 text-green-500 mx-auto" />
          )}
          <p className="text-sm text-gray-600 mt-2">
            {uploadingOriginal
              ? t("myProjects.stepper.step2.uploading")
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
                  {file.name || `File_${i + 1}`}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 🧩 Note + Submit */}
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
