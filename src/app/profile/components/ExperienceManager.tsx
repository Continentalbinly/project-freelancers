"use client";

import { useState, useEffect } from "react";
import { requireDb } from "@/service/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import type { Profile } from "@/types/profile";

interface ExperienceItem {
  title: string;
  company: string;
  period: string; // Legacy: kept for backward compatibility
  startDate?: string; // New: start date (YYYY-MM-DD)
  endDate?: string; // New: end date (YYYY-MM-DD) or empty for current
  type?: {
    en: string;
    lo: string;
  };
  description: string;
}

interface ExperienceManagerProps {
  userId: string;
  profile: Profile;
  onUpdate: () => void;
}

export default function ExperienceManager({ userId, profile, onUpdate }: ExperienceManagerProps) {
  const { t, currentLanguage } = useTranslationContext();
  
  // Experience types with English and Lao translations
  // Moved inside component to ensure re-render on language change
  const experienceTypes = [
    { value: "full-time", en: "Full-time", lo: "ເຕັມເວລາ" },
    { value: "part-time", en: "Part-time", lo: "ບາງເວລາ" },
    { value: "contract", en: "Contract", lo: "ສັນຍາ" },
    { value: "intern", en: "Intern", lo: "ຝຶກງານ" },
    { value: "freelance", en: "Freelance", lo: "ອິດສະລະ" },
    { value: "partnership", en: "Partnership", lo: "ການເປັນຄູ່ຮ່ວມງານ" },
    { value: "volunteer", en: "Volunteer", lo: "ອາສາສະໝັກ" },
    { value: "temporary", en: "Temporary", lo: "ຊົ່ວຄາວ" },
  ];

  // Force re-render when language changes
  // Use currentLanguage in a way that React will track as a dependency
  useEffect(() => {
    // This effect runs when currentLanguage changes, ensuring component updates
  }, [currentLanguage]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ExperienceItem>({
    title: "",
    company: "",
    period: "",
    startDate: "",
    endDate: "",
    type: undefined,
    description: "",
  });

  const experience = profile.experience || [];

  // Helper to parse period string to dates
  const parsePeriodToDates = (period: string): { startDate: string; endDate: string } => {
    if (!period) return { startDate: "", endDate: "" };
    
    // Try to parse formats like "Jan 2020 - Dec 2022" or "2020-01 - 2022-12"
    const parts = period.split(" - ").map(p => p.trim());
    if (parts.length === 2) {
      // Try to parse dates - this is a simple parser, you might want to enhance it
      return { startDate: "", endDate: "" };
    }
    return { startDate: "", endDate: "" };
  };

  // Helper to format dates to period string
  const formatDatesToPeriod = (startDate: string, endDate: string): string => {
    if (!startDate) return "";
    
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${month} ${year}`;
    };
    
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : "Present";
    return end ? `${start} - ${end}` : start;
  };

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({ title: "", company: "", period: "", startDate: "", endDate: "", type: undefined, description: "" });
    setShowAddModal(true);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    const exp = experience[index] as any; // Use any to handle dynamic fields
    
    // If period exists but no dates, try to parse it
    let startDate = (exp.startDate as string) || "";
    let endDate = (exp.endDate as string) || "";
    
    // If we have period but no dates, keep period for display but allow new date selection
    if (!startDate && !endDate && exp.period) {
      // Keep period as is, user can update with date picker
    }
    
    setFormData({
      ...exp,
      startDate,
      endDate,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm(t("profile.experience.confirmDelete") || "Are you sure you want to delete this experience?")) {
      return;
    }

    try {
      const updatedExperience = experience.filter((_, i) => i !== index);
      await updateDoc(doc(requireDb(), "profiles", userId), {
        experience: updatedExperience,
        updatedAt: serverTimestamp(),
      });
      toast.success(t("profile.experience.deleted") || "Experience deleted");
      onUpdate();
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error(t("common.error") || "Failed to delete experience");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.company || (!formData.startDate && !formData.period)) {
      toast.error(t("profile.experience.requiredFields") || "Please fill in all required fields");
      return;
    }

    try {
      // Format period from dates if dates are provided
      const period = formData.startDate 
        ? formatDatesToPeriod(formData.startDate, formData.endDate || "")
        : formData.period;
      
      const experienceData: ExperienceItem = {
        title: formData.title,
        company: formData.company,
        period,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        type: formData.type,
        description: formData.description,
      };

      const updatedExperience = [...experience];
      if (editingIndex !== null) {
        updatedExperience[editingIndex] = experienceData;
        toast.success(t("profile.experience.updated") || "Experience updated");
      } else {
        updatedExperience.push(experienceData);
        toast.success(t("profile.experience.added") || "Experience added");
      }

      await updateDoc(doc(requireDb(), "profiles", userId), {
        experience: updatedExperience,
        updatedAt: serverTimestamp(),
      });

      setShowAddModal(false);
      setEditingIndex(null);
      setFormData({ title: "", company: "", period: "", startDate: "", endDate: "", type: undefined, description: "" });
      onUpdate();
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error(t("common.error") || "Failed to save experience");
    }
  };

  // Force component to re-render when language changes by using currentLanguage as key
  return (
    <div key={`experience-manager-${currentLanguage}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
          {t("profile.experience.title") || "Experience"}
        </h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("profile.experience.addItem") || "Add Experience"}
        </button>
      </div>

      {experience.length > 0 ? (
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div key={idx} className="border-l-2 border-primary pl-4 relative group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary text-sm sm:text-base">{exp.title}</h3>
                  <p className="text-text-secondary text-sm">{exp.company}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {(exp as any).type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {currentLanguage === "lo" ? (exp as any).type.lo : (exp as any).type.en}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm text-text-secondary">{exp.period}</p>
                  </div>
                  {exp.description && (
                    <p className="text-xs sm:text-sm text-text-secondary mt-2">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                    title={t("profile.experience.editItem") || "Edit"}
                  >
                    <Edit2 className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                    title={t("common.remove") || "Delete"}
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm sm:text-base">
            {t("profile.experience.empty") || "No experience added yet"}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" key={`modal-${currentLanguage}`}>
          <div className="bg-background rounded-xl p-6 w-full max-w-2xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary">
                {editingIndex !== null
                  ? t("profile.experience.editItem") || "Edit Experience"
                  : t("profile.experience.addItem") || "Add Experience"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingIndex(null);
                  setFormData({ title: "", company: "", period: "", description: "" });
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.experience.titleLabel") || "Job Title"} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  placeholder={t("profile.experience.titlePlaceholder") || "e.g., Software Engineer"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.experience.companyLabel") || "Company"} *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  placeholder={t("profile.experience.companyPlaceholder") || "e.g., Tech Company Inc."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.experience.typeLabel") || "Employment Type"}
                </label>
                <select
                  value={formData.type ? `${formData.type.en}|${formData.type.lo}` : ""}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue) {
                      const [en, lo] = selectedValue.split("|");
                      setFormData({ ...formData, type: { en, lo } });
                    } else {
                      setFormData({ ...formData, type: undefined });
                    }
                  }}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                >
                  <option value="">{t("profile.experience.selectType") || "Select type (optional)"}</option>
                  {experienceTypes.map((type) => (
                    <option key={type.value} value={`${type.en}|${type.lo}`}>
                      {currentLanguage === "lo" ? type.lo : type.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.experience.periodLabel") || "Period"} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      {t("profile.experience.startDate") || "Start Date"} *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      max={formData.endDate || undefined}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      {t("profile.experience.endDate") || "End Date"} 
                      <span className="text-xs text-text-secondary ml-1">
                        ({t("profile.experience.leaveEmptyForCurrent") || "Leave empty for current"})
                      </span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || undefined}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    />
                  </div>
                </div>
                {formData.startDate && (
                  <p className="mt-2 text-xs text-text-secondary">
                    {formatDatesToPeriod(formData.startDate, formData.endDate || "")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.experience.descriptionLabel") || "Description"}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none bg-background text-text-primary"
                  placeholder={t("profile.experience.descriptionPlaceholder") || "Describe your responsibilities and achievements..."}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-6 border-t border-border">
              <button
                onClick={handleSave}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t("common.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingIndex(null);
                  setFormData({ title: "", company: "", period: "", startDate: "", endDate: "", type: undefined, description: "" });
                }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-white/20 transition-colors text-text-primary bg-background"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

