"use client";

import { useRef, useState } from "react";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { PencilIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatEarnings } from "@/service/currencyUtils";
import { db } from "@/service/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfileHeader({
  user,
  profile,
  refreshProfile,
  setIsEditing,
  setEditField,
  setEditValue,
  t,
}: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** 📁 Open file selector */
  const handleFileButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  /** 🖼️ Handle selected file */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large (max 5MB)");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  /** ❌ Remove selected file */
  const removeSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  /** ☁️ Upload to API and update Firestore */
  const handleProfileImageUpload = async () => {
    if (!selectedFile || !user) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folderType", "profileImage");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!result.success) {
        alert(t("profile.profileImage.uploadFailed"));
        return;
      }

      const userRef = doc(db, "profiles", user.uid);
      const prevDoc = await getDoc(userRef);
      const prevUrl = prevDoc.exists() ? prevDoc.data().avatarUrl : "";

      await updateDoc(userRef, {
        avatarUrl: result.data.url,
        updatedAt: new Date(),
      });

      if (prevUrl && prevUrl !== result.data.url) {
        await fetch("/api/delete-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: prevUrl }),
        });
      }

      await refreshProfile?.();
      removeSelectedFile();
      alert(t("profile.profileImage.updateSuccess"));
    } catch (err) {
      console.error("Upload failed:", err);
      alert(t("profile.profileImage.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* === Avatar + Upload === */}
        <div className="flex flex-col items-center w-full sm:w-auto text-center">
          <div className="relative mb-3">
            <Avatar {...getAvatarProps(profile, user)} size="2xl" />
          </div>

          {/* Upload section */}
          {previewUrl ? (
            <div className="w-full max-w-[10rem] space-y-3">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-2 border-primary"
                />
                <button
                  onClick={removeSelectedFile}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={handleProfileImageUpload}
                disabled={uploading}
                className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 text-sm transition"
              >
                {uploading
                  ? t("profile.profileImage.uploading")
                  : t("profile.profileImage.updateProfileImage")}
              </button>
            </div>
          ) : (
            <div className="w-full max-w-[10rem] space-y-2">
              <button
                onClick={handleFileButtonClick}
                className="w-full px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm flex items-center justify-center gap-2 transition"
              >
                <PhotoIcon className="w-4 h-4" />
                {t("profile.profileImage.changePhoto")}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* === Profile Info + Stats === */}
        <div className="flex-1 w-full text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-4 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                {profile?.fullName || user.email?.split("@")[0]}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {profile?.email || user.email}
              </p>
            </div>

            <button
              onClick={() => {
                setIsEditing(true);
                setEditField("fullName");
                setEditValue(profile?.fullName || "");
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              <PencilIcon className="w-4 h-4" />
              {t("common.edit")}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <Stat
              label={t("profile.stats.active")}
              value={profile?.activeProjects || 0}
              color="text-primary"
            />
            <Stat
              label={t("profile.stats.completed")}
              value={profile?.projectsCompleted || 0}
              color="text-success"
            />
            <Stat
              label={t("profile.stats.earned")}
              value={formatEarnings(profile?.totalEarned || 0)}
              color="text-secondary"
            />
            <Stat
              label={t("profile.stats.rating")}
              value={`${profile?.rating || 0}/5`}
              color="text-warning"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: any) {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className={`text-lg sm:text-xl font-semibold ${color}`}>{value}</div>
      <div className="text-xs sm:text-sm text-text-secondary">{label}</div>
    </div>
  );
}
