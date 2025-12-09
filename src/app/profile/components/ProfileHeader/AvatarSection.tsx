"use client";

import { useRef, useState } from "react";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { db } from "@/service/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function AvatarSection({
  user,
  profile,
  t,
  setLocalProfile,
  refreshProfile,
}: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);

  const openFile = () => fileRef.current?.click();

  const onSelectFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only image files allowed");
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      return toast.error("Max size 2GB");
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const remove = () => {
    URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setProgress(0);
  };

  const upload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("folderType", "profileImage");

      const res = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              headers: { "Content-Type": "application/json" },
            })
          );
        };

        xhr.onerror = reject;
        xhr.send(form);
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      const userRef = doc(db, "profiles", user.uid);
      const prev = await getDoc(userRef);

      await updateDoc(userRef, {
        avatarUrl: result.data.url,
        updatedAt: new Date(),
      });

      setLocalProfile((p: any) => ({ ...p, avatarUrl: result.data.url }));
      await refreshProfile();

      toast.success("Profile updated");
      remove();
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <Avatar
        key={profile?.avatarUrl}
        {...getAvatarProps(profile, user)}
        size="2xl"
      />

      {previewUrl ? (
        <div className="w-full mt-4 space-y-3">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src={previewUrl}
              className="rounded-full border-2 border-primary object-cover w-full h-full"
            />
            <button
              onClick={remove}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>

          {uploading ? (
            <div className="w-full bg-gray-200 rounded-lg h-3 overflow-hidden">
              <div
                className="bg-primary h-3 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <button
              onClick={upload}
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              {t("profile.profileImage.updateProfileImage")}
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={openFile}
          className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <PhotoIcon className="w-4 h-4" />
          {t("profile.profileImage.changePhoto")}
        </button>
      )}

      <input
        type="file"
        ref={fileRef}
        accept="image/*"
        className="hidden"
        onChange={onSelectFile}
      />
    </div>
  );
}
