"use client";

import { useState } from "react";
import { db } from "@/service/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify"; // ✅ import toast

export default function EditModal({
  editField,
  editValue,
  setEditValue,
  setIsEditing,
  setLocalProfile,
  user,
  refreshProfile,
  t,
}: any) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !editField) return;
    setSaving(true);

    try {
      const userRef = doc(db, "profiles", user.uid);
      await updateDoc(userRef, {
        [editField]: editValue,
        updatedAt: new Date(),
      });

      // ✅ Instant UI update
      setLocalProfile?.((prev: any) => ({
        ...prev,
        [editField]: editValue,
      }));

      await refreshProfile?.();
      setIsEditing(false);

      // 🎉 Toastify Success
      toast.success(
        t("common.updateSuccess") || "Profile updated successfully!",
        {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
    } catch (err) {
      //console.error("❌ Failed to update:", err);

      // ❌ Toastify Error
      toast.error(t("common.updateFailed") || "Failed to update profile.", {
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-md mx-4 border border-border dark:border-gray-800">
        <h3 className="text-lg font-semibold   mb-4">
          {t("profile.editModal.title")} {editField}
        </h3>

        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg dark:border-gray-700   focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving
              ? t("profile.editModal.saving") || "Saving..."
              : t("profile.editModal.save") || "Save"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-outline flex-1"
          >
            {t("profile.editModal.cancel") || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
