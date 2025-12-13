"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/service/firebase";
import type { CatalogForm } from "./types";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { FolderOpen, Search, Tag, X, Plus, CheckCircle2 } from "lucide-react";

type Category = { id: string; name_en?: string; name_lo?: string; description?: string };

export default function StepCategoryTags({ form, setForm }: { form: CatalogForm; setForm: (f: Partial<CatalogForm>) => void }) {
  const { currentLanguage, t } = useTranslationContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setCategories(rows as Category[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const labelFor = (c: Category) => (currentLanguage === "lo" ? c.name_lo || c.name_en : c.name_en || c.name_lo) || c.id;
  const filtered = categories.filter((c) => labelFor(c).toLowerCase().includes(q.toLowerCase()));

  const addTag = (v: string) => {
    const t = v.trim();
    if (!t) return;
    setForm({ tags: Array.from(new Set([...(form.tags || []), t])) });
  };
  const removeTag = (t: string) => setForm({ tags: (form.tags || []).filter((i) => i !== t) });

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          {t("stepCategory.chooseCategory") || "Choose Category"}
        </label>

        {/* Search box */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("stepCategory.searchCategories") || "Search categories…"}
            className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-background-secondary" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {filtered.map((cat) => {
              const selected = form.categoryId === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setForm({ categoryId: cat.id, category: { id: cat.id, name_en: cat.name_en, name_lo: cat.name_lo } })}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                    selected
                      ? "border-primary bg-gradient-to-br from-primary/15 to-secondary/15 shadow-lg"
                      : "border-border hover:border-primary/40 bg-background hover:shadow-sm"
                  }`}
                >
                  <div className={`font-semibold mb-1 pr-6 ${selected ? "text-primary" : "text-text-primary"}`}>
                    {labelFor(cat)}
                  </div>
                  {cat.description && (
                    <div className="text-xs text-text-secondary line-clamp-2">{cat.description}</div>
                  )}
                  {selected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-sm text-text-secondary py-6 border-2 border-dashed border-border rounded-xl">
                {t("stepCategory.noResults") || "No categories match your search"}
              </div>
            )}
          </div>
        )}

        {!form.categoryId && !loading && (
          <p className="text-xs text-error mt-3 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-error" />
            {t("stepCategory.selectCategoryRequired") || "Please select a category to continue"}
          </p>
        )}
      </div>

      {/* Tags Section */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-secondary" />
          </div>
          {t("stepCategory.addTags") || "Add Tags"}
        </label>

        <div className="flex gap-2">
          <input
            id="tagInput2"
            placeholder={t("stepCategory.tagPlaceholder") || "Type a tag and press Enter or click Add"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const el = e.target as HTMLInputElement;
                addTag(el.value);
                el.value = "";
              }
            }}
            className="flex-1 px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
          />
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-secondary to-primary text-white rounded-xl hover:shadow-lg hover:shadow-secondary/30 transition-all flex items-center gap-2 font-medium"
            onClick={() => {
              const el = document.getElementById("tagInput2") as HTMLInputElement | null;
              if (el) {
                addTag(el.value);
                el.value = "";
              }
            }}
          >
            <Plus className="w-4 h-4" />
            {t("stepCategory.add") || "Add"}
          </button>
        </div>

        {(form.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {form.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20 group hover:shadow-md transition-all"
              >
                {t}
                <button
                  type="button"
                  className="p-0.5 rounded-full hover:bg-primary/20 transition-all"
                  onClick={() => removeTag(t)}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {(form.tags || []).length === 0 && (
          <p className="mt-3 text-sm text-text-secondary italic">{t("stepCategory.tagsHint") || "Add relevant tags to help clients find your service"}</p>
        )}
      </div>
    </div>
  );
}
