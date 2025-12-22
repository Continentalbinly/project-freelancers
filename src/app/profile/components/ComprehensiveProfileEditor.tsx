"use client";

import { useState } from "react";
import { requireDb } from "@/service/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { Profile } from "@/types/profile";
import { Save, X, Plus } from "lucide-react";

interface ComprehensiveProfileEditorProps {
  profile: Profile;
  userId: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function ComprehensiveProfileEditor({
  profile,
  userId,
  onSave,
  onCancel,
}: ComprehensiveProfileEditorProps) {
  const { t } = useTranslationContext();
  const [formData, setFormData] = useState<Partial<Profile>>({
    fullName: profile.fullName || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    location: profile.location || "",
    city: profile.city || "",
    country: profile.country || "",
    website: profile.website || "",
    dateOfBirth: profile.dateOfBirth || "",
    gender: profile.gender || "prefer_not_to_say",
    skills: profile.skills || [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const currentSkills = formData.skills || [];
    
    // Check if skill already exists
    if (currentSkills.includes(trimmed)) {
      toast.error(t("auth.signup.errors.skillExists") || "This skill is already added");
      setSkillInput("");
      return;
    }

    // Check limit
    if (currentSkills.length >= 5) {
      toast.error(t("auth.signup.errors.skillLimit") || "Maximum 5 skills allowed");
      return;
    }

    setFormData({
      ...formData,
      skills: [...currentSkills, trimmed],
    });
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = formData.skills || [];
    setFormData({
      ...formData,
      skills: currentSkills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(requireDb(), "profiles", userId), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      toast.success(t("profile.editor.saved") || "Profile updated successfully");
      onSave();
    } catch {
      // Silent fail
      toast.error(t("common.error") || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto scroll-smooth">
      <div className="bg-background rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scroll-smooth border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {t("profile.editor.title") || "Edit Profile"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {t("profile.editor.basicInfo") || "Basic Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.fullName") || "Full Name"} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.phone") || "Phone"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.dateOfBirth") || "Date of Birth"}
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.gender") || "Gender"}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" | "prefer_not_to_say" })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  <option value="male">{t("profile.gender.male") || "Male"}</option>
                  <option value="female">{t("profile.gender.female") || "Female"}</option>
                  <option value="other">{t("profile.gender.other") || "Other"}</option>
                  <option value="prefer_not_to_say">{t("profile.gender.preferNotToSay") || "Prefer not to say"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {t("profile.editor.location") || "Location"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.city") || "City"}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.country") || "Country"}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.personalInfo.location") || "Location"}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">
              {t("profile.editor.professional") || "Professional Information"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("profile.editor.bio") || "Bio"}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none bg-background text-text-primary"
                placeholder={t("profile.editor.bioPlaceholder") || "Tell us about yourself..."}
              />
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("profile.skills") || "Skills"}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillInputKeyPress}
                  placeholder={
                    (formData.skills || []).length >= 5
                      ? t("auth.signup.placeholders.skillsLimit") || "Maximum 5 skills reached"
                      : t("auth.signup.placeholders.skills") || "Type a skill and press Enter or comma"
                  }
                  disabled={(formData.skills || []).length >= 5}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 bg-background text-text-primary focus:outline-none focus:border-primary transition-colors ${
                    (formData.skills || []).length >= 5
                      ? "border-border/50 opacity-50 cursor-not-allowed"
                      : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={(formData.skills || []).length >= 5 || !skillInput.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    (formData.skills || []).length >= 5 || !skillInput.trim()
                      ? "bg-background-secondary text-text-secondary cursor-not-allowed opacity-50"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t("common.add") || "Add"}
                </button>
              </div>

              {/* Skills Display */}
              {(formData.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.skills || []).map((skill) => (
                    <div
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary text-sm font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-primary hover:text-primary/80 transition-colors focus:outline-none"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hint */}
              <p className="mt-1 text-xs text-text-secondary">
                {(formData.skills || []).length >= 5
                  ? t("auth.signup.fields.skillsLimitReached") || "Maximum 5 skills reached. Remove a skill to add another."
                  : t("auth.signup.fields.skillsHint") || "Type a skill and press Enter, comma, or click Add. Maximum 5 skills."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("profile.editor.website") || "Website"}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving || !formData.fullName}
              className="flex-1 btn btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? t("common.processing") || "Saving..." : t("common.save") || "Save"}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-border rounded-lg hover:bg-background-secondary dark:hover:bg-gray-700/50 transition-colors text-text-primary"
            >
              {t("common.cancel") || "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
