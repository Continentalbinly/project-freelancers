"use client";

import { FileText, Info } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { CatalogForm } from "./types";

export default function StepBasics({ form, setForm }: { form: CatalogForm; setForm: (f: Partial<CatalogForm>) => void }) {
  const { t } = useTranslationContext();
  const titleLength = form.title.length;
  const descLength = form.description.length;
  const titleMin = 5;
  const titleMax = 120;
  const descMin = 20;
  const descMax = 5000;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="group">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-focus-within:from-primary/20 group-focus-within:to-secondary/20 transition-all">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            {t("stepBasics.title") || "Service Title"}
          </label>
          <span
            className={`text-xs font-medium ${
              titleLength >= titleMin ? "text-success" : "text-text-secondary"
            }`}
          >
            {titleLength} / {titleMin}+ / {titleMax} {t("stepBasics.chars") || "chars"}
          </span>
        </div>
        <input
          value={form.title}
          onChange={(e) => setForm({ title: e.target.value.slice(0, titleMax) })}
          placeholder={t("stepBasics.titlePlaceholder") || "e.g., I will design a modern, responsive landing page"}
          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-text-primary placeholder:text-text-secondary/60"
          maxLength={titleMax}
        />
        <div className="flex items-start gap-2 mt-2 text-xs text-text-secondary">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{t("stepBasics.titleHint") || "Create a clear, specific title that describes your service. Good titles help clients find you."}</p>
        </div>
      </div>

      {/* Description */}
      <div className="group">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center group-focus-within:from-secondary/20 group-focus-within:to-primary/20 transition-all">
              <FileText className="w-4 h-4 text-secondary" />
            </div>
            {t("stepBasics.description") || "Description"}
          </label>
          <span
            className={`text-xs font-medium ${
              descLength >= descMin ? "text-success" : "text-text-secondary"
            }`}
          >
            {descLength} / {descMin}+ / {descMax} {t("stepBasics.chars") || "chars"}
          </span>
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ description: e.target.value.slice(0, descMax) })}
          rows={10}
          placeholder={t("stepBasics.descriptionPlaceholder") || "Describe your service in detail:\n• What you will deliver\n• Your process and timeline\n• What's included in the package\n• Any requirements from the client"}
          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-text-primary placeholder:text-text-secondary/60 resize-none"
          maxLength={descMax}
        />
        <div className="flex items-start gap-2 mt-2 text-xs text-text-secondary">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>{t("stepBasics.descriptionHint") || "Detailed descriptions increase trust and conversions. Explain your process, deliverables, and what makes your service unique."}</p>
        </div>
      </div>
    </div>
  );
}
