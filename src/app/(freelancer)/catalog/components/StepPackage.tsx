"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { Package, DollarSign, Clock, CheckCircle, Plus, X, RotateCcw } from "lucide-react";
import type { CatalogForm, PackageTier } from "./types";

export default function StepPackage({ form, setForm }: { form: CatalogForm; setForm: (f: Partial<CatalogForm>) => void }) {
  const { t } = useTranslationContext();
  const [activeTab, setActiveTab] = useState(0);
  const packages = form.packages || [];
  const pkg = packages[activeTab];

  const updatePackage = (idx: number, updated: Partial<PackageTier>) => {
    const newPkgs = [...packages];
    newPkgs[idx] = { ...newPkgs[idx], ...updated };
    setForm({ packages: newPkgs });
  };

  const addFeature = (v: string, pkgIdx: number) => {
    const t = v.trim();
    if (!t) return;
    const p = packages[pkgIdx];
    updatePackage(pkgIdx, { features: [...(p.features || []), t] });
  };

  const removeFeature = (f: string, pkgIdx: number) => {
    const p = packages[pkgIdx];
    updatePackage(pkgIdx, { features: (p.features || []).filter((i) => i !== f) });
  };

  const addPackage = () => {
    const newId = `pkg-${Date.now()}`;
    const newPkgs = [...packages, { id: newId, name: "", price: 0, deliveryDays: 0, features: [] }];
    setForm({ packages: newPkgs });
    setActiveTab(newPkgs.length - 1);
  };

  const removePackage = (idx: number) => {
    if (packages.length <= 1) return;
    const newPkgs = packages.filter((_, i) => i !== idx);
    setForm({ packages: newPkgs });
    setActiveTab(Math.max(0, activeTab - 1));
  };

  return (
    <div className="space-y-8">
      {/* Package Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {packages.map((p, idx) => (
          <div key={idx} className="relative group">
            <button
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === idx
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                  : "bg-background-secondary border border-border text-text-primary hover:border-primary/30"
              }`}
            >
              {p.name || `${t("stepPackage.package") || "Package"} ${idx + 1}`}
            </button>
            {packages.length > 1 && (
              <button
                type="button"
                onClick={() => removePackage(idx)}
                className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full hover:bg-error/80 transition-all shadow-md opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPackage}
          className="px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("stepPackage.addTier") || "Add Tier"}
        </button>
      </div>

      {pkg && (
        <>
          {/* Package Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-focus-within:from-indigo-500/20 group-focus-within:to-purple-500/20 transition-all">
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                {t("stepPackage.name") || "Package Name"}
              </label>
              <input
                value={pkg.name}
                onChange={(e) => updatePackage(activeTab, { name: e.target.value })}
                placeholder={t("stepPackage.namePlaceholder") || "e.g., Basic, Standard, Premium"}
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center group-focus-within:from-emerald-500/20 group-focus-within:to-teal-500/20 transition-all">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                {t("stepPackage.price") || "Price (LAK)"}
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={pkg.price ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updatePackage(activeTab, { price: val === "" ? undefined : Number(val) });
                }}
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center group-focus-within:from-amber-500/20 group-focus-within:to-orange-500/20 transition-all">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                {t("stepPackage.deliveryDays") || "Delivery Days"}
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={pkg.deliveryDays ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updatePackage(activeTab, { deliveryDays: val === "" ? undefined : Number(val) });
                }}
                placeholder="3"
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center group-focus-within:from-rose-500/20 group-focus-within:to-pink-500/20 transition-all">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                </div>
                {t("stepPackage.revisionLimit") || "Revision Limit"}
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={pkg.revisionLimit ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updatePackage(activeTab, { revisionLimit: val === "" ? undefined : Number(val) });
                }}
                placeholder="2"
                min="0"
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
              />
              <p className="mt-2 text-xs text-text-secondary">{t("stepPackage.revisionLimitInfo") || "How many times can clients request revisions? (default: 2)"}</p>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
                {t("stepPackage.features") || "Package Features"}
            </label>

            <div className="flex gap-2">
              <input
                id={`featInput-${activeTab}`}
                placeholder={t("stepPackage.featurePlaceholder") || "Type a feature and press Enter"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const el = e.target as HTMLInputElement;
                    addFeature(el.value, activeTab);
                    el.value = "";
                  }
                }}
                className="flex-1 px-4 py-3 border-2 border-border rounded-xl bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 font-medium"
                onClick={() => {
                  const el = document.getElementById(`featInput-${activeTab}`) as HTMLInputElement | null;
                  if (el) {
                    addFeature(el.value, activeTab);
                    el.value = "";
                  }
                }}
              >
                <Plus className="w-4 h-4" />
                {t("stepPackage.add") || "Add"}
              </button>
            </div>

            {(pkg.features || []).length > 0 && (
              <div className="mt-4 p-4 bg-background-secondary rounded-xl border border-border">
                <div className="space-y-2">
                  {pkg.features.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm text-text-primary">{f}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(f, activeTab)}
                        className="p-1.5 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(pkg.features || []).length === 0 && (
              <p className="mt-3 text-sm text-text-secondary italic">{t("stepPackage.noFeatures") || "No features added. Add features to make this tier more attractive."}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
