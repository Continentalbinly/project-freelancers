"use client";

import { useState, useRef } from "react";
import { db } from "@/service/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function ProfileImageUploader({ user, refreshProfile, t }: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Open file picker */
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  /** Validate and preview selected image */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert(t("profile.profileImage.invalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t("profile.profileImage.maxSize"));
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /** Remove previewed file */
  const removeSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  /** Upload image to API and update Firestore */
  const handleProfileImageUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);
      const userRef = doc(db, "profiles", user.uid);
      const userDoc = await getDoc(userRef);
      const prevAvatar = userDoc.exists()
        ? userDoc.data()?.avatarUrl || ""
        : "";

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folderType", "profileImage");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await uploadResponse.json();

      if (!result.success) throw new Error(result.error || "Upload failed");

      await updateDoc(userRef, {
        avatarUrl: result.data.url,
        updatedAt: new Date(),
      });

      // Delete old avatar (optional)
      if (prevAvatar && prevAvatar !== result.data.url) {
        try {
          await fetch("/api/delete-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: prevAvatar }),
          });
        } catch (err) {
          console.warn("Failed to delete old avatar", err);
        }
      }

      await refreshProfile();
      alert(t("profile.profileImage.updateSuccess"));
      removeSelectedFile();
    } catch (err) {
      console.error("Error uploading profile image:", err);
      alert(t("profile.profileImage.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-[200px] space-y-3">
      {previewUrl ? (
        <div className="space-y-2">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full rounded-full object-cover border-2 border-primary"
            />
            <button
              type="button"
              onClick={removeSelectedFile}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleProfileImageUpload}
            disabled={uploading}
            className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition disabled:opacity-50 text-sm"
          >
            {uploading
              ? t("profile.profileImage.uploading")
              : t("profile.profileImage.updateProfileImage")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleFileButtonClick}
            className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm flex items-center justify-center gap-2"
          >
            <PhotoIcon className="w-4 h-4" />
            {t("profile.profileImage.changePhoto")}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
