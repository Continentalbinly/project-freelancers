"use client";

import { useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { db } from "@/service/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface SkillsTabProps {
  t: (key: string) => string;
  profile: any;
  user: any;
  refreshProfile: () => Promise<void>;
}

export default function SkillsTab({
  t,
  profile,
  user,
  refreshProfile,
}: SkillsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [adding, setAdding] = useState(false);

  /** ➕ Add a new skill to Firestore */
  const addSkill = async () => {
    if (!user || !newSkill.trim()) return;
    const skill = newSkill.trim();

    try {
      setAdding(true);
      const currentSkills = profile.skills || [];
      if (currentSkills.includes(skill)) {
        alert(t("profile.skillsSection.skillExists") || "Skill already added");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        skills: [...currentSkills, skill],
        updatedAt: new Date(),
      });

      setNewSkill("");
      setShowModal(false);
      await refreshProfile();
    } catch (err) {
      //console.error("Error adding skill:", err);
      alert(t("profile.skillsSection.addFailed") || "Failed to add skill");
    } finally {
      setAdding(false);
    }
  };

  /** ❌ Remove a skill */
  const removeSkill = async (skillToRemove: string) => {
    if (!user) return;
    try {
      const updatedSkills = (profile.skills || []).filter(
        (s: string) => s !== skillToRemove
      );

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        skills: updatedSkills,
        updatedAt: new Date(),
      });

      await refreshProfile();
    } catch (err) {
      //console.error("Error removing skill:", err);
      alert(
        t("profile.skillsSection.removeFailed") || "Failed to remove skill"
      );
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            {t("profile.skillsSection.title")}
          </h3>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {t("profile.skillsSection.addSkill")}
          </button>
        </div>

        {/* Skills List */}
        <div className="space-y-4">
          {profile?.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-light text-primary rounded-full hover:bg-primary/15 transition"
                >
                  <span className="text-sm font-medium">{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-primary hover:text-primary-hover"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {t("profile.skillsSection.noSkills")}
              </h3>
              <p className="text-text-secondary">
                {t("profile.skillsSection.noSkillsDesc")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* === Modal === */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-text-secondary hover:text-text-primary transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {t("profile.skillsSection.addSkill")}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder={t("profile.skillsSection.enterSkillName")}
                className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition text-sm"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
                <button
                  onClick={addSkill}
                  disabled={adding || !newSkill.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition text-sm"
                >
                  {adding
                    ? t("profile.skillsSection.adding") || "Adding..."
                    : t("common.save") || "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
