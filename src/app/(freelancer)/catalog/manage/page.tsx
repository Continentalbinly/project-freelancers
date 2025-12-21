"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, onSnapshot, query, where, orderBy, updateDoc, doc, getDocs } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Catalog } from "@/types/catalog";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { Plus, Edit, Eye, Zap, Package as PackageIcon, DollarSign } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";

// Skeleton Loader Component
function CatalogSkeleton() {
  return (
    <div className="border border-border rounded-xl p-4 bg-background-secondary animate-pulse">
      <div className="space-y-4">
        {/* Header with image placeholder */}
        <div className="h-32 bg-background rounded-lg"></div>

        {/* Title and category */}
        <div className="space-y-2">
          <div className="h-6 bg-background rounded-lg w-3/4"></div>
          <div className="h-4 bg-background rounded w-1/3"></div>
        </div>

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3 bg-background rounded w-full"></div>
          <div className="h-3 bg-background rounded w-5/6"></div>
        </div>

        {/* Pricing info */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="h-4 bg-background rounded w-32"></div>
          <div className="h-4 bg-background rounded w-40"></div>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-background rounded-full w-16"></div>
          <div className="h-6 bg-background rounded-full w-20"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <div className="flex-1 h-9 bg-background rounded-lg"></div>
          <div className="flex-1 h-9 bg-background rounded-lg"></div>
          <div className="flex-1 h-9 bg-background rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function MyCatalogPage() {
  const { user } = useAuth();
  const { isAuthorized, isLoading } = useRoleGuard({ requiredRole: "freelancer", redirectTo: "/" });
  const { t, currentLanguage } = useTranslationContext();
  const [items, setItems] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  // Load categories to map IDs to names
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(requireDb(), "categories"));
        const cats = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const getCategoryName = useMemo(() => {
    return (categoryId?: string) => {
      if (!categoryId) return "Uncategorized";
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return categoryId;
      return currentLanguage === "lo"
        ? cat.name_lo || cat.name_en
        : cat.name_en || "";
    };
  }, [categories, currentLanguage]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(requireDb(), "catalogs"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows as Catalog[]);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handlePublishToggle = async (catalog: Catalog) => {
    setPublishing(catalog.id);
    try {
      const next = catalog.status === "published" ? "draft" : "published";
      await updateDoc(doc(requireDb(), "catalogs", catalog.id), { status: next });
    } finally {
      setPublishing(null);
    }
  };

  if (!user || isLoading) return null;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-text-primary">
              {t("manageCatalogPage.title") || "My Services"}
            </h1>
            <Link
              href="/catalog/create"
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("manageCatalogPage.createService") || "Create Service"}
            </Link>
          </div>
          <p className="text-text-secondary">
            {t("manageCatalogPage.subtitle") || "Manage your service offerings and pricing tiers"}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <CatalogSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-background-secondary/50 py-16 text-center">
            <PackageIcon className="w-12 h-12 text-text-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t("manageCatalogPage.noServicesYet") || "No Services Yet"}
            </h3>
            <p className="text-text-secondary mb-6">
              {t("manageCatalogPage.createFirstService") || "Create your first service to start offering work"}
            </p>
            <Link
              href="/catalog/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("manageCatalogPage.createFirstService") || "Create Your First Service"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {items.map((catalog) => (
              <div
                key={catalog.id}
                className="group relative border border-border rounded-xl overflow-hidden bg-background-secondary hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Cover Image or Gradient Background */}
                <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                  {catalog.images?.[0] ? (
                    <img
                      src={catalog.images[0]}
                      alt={catalog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageIcon className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {catalog.status === "published" ? (
                      <div className="px-3 py-1 rounded-full bg-success/20 dark:bg-success/30 border border-success/30 dark:border-success/40 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-success dark:bg-color-primary-dark animate-pulse"></div>
                        <span className="text-xs font-medium text-success dark:text-color-primary-dark">Published</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-full bg-background-secondary dark:bg-background-secondary-dark border border-border dark:border-border-dark">
                        <span className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Draft</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title & Category */}
                  <div>
                    <h3 className="font-semibold text-text-primary line-clamp-2 text-sm mb-1">
                      {catalog.title}
                    </h3>
                    {catalog.category && (
                      <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {getCategoryName(catalog.category)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-2">{catalog.description}</p>

                  {/* Pricing & Packages Info */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs text-text-secondary">
                        {catalog.packages?.length || 0} {t("manageCatalogPage.tier") || "tier"}{(catalog.packages?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {catalog.packages?.[0] && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <DollarSign className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-xs text-text-primary font-semibold">
                          {t("manageCatalogPage.from") || "From"} {catalog.packages[0].price?.toLocaleString()} LAK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {(catalog.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {catalog.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-background border border-border/50 text-text-secondary">
                          #{tag}
                        </span>
                      ))}
                      {catalog.tags.length > 2 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border/50 text-text-secondary">
                          +{catalog.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-1 sm:gap-2 pt-3 border-t border-border">
                    <Link
                      href={`/catalog/${catalog.id}`}
                      className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-background hover:bg-background hover:border-primary/30 border border-border text-text-primary text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[32px]"
                    >
                      <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">{t("manageCatalogPage.view") || "View"}</span>
                    </Link>
                    <Link
                      href={`/catalog/${catalog.id}/edit`}
                      className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-background hover:bg-background hover:border-primary/30 border border-border text-text-primary text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 min-h-[32px]"
                    >
                      <Edit className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">{t("manageCatalogPage.edit") || "Edit"}</span>
                    </Link>
                    <button
                      onClick={() => handlePublishToggle(catalog)}
                      disabled={publishing === catalog.id}
                      className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 sm:gap-1.5 disabled:opacity-50 min-h-[32px] ${
                        catalog.status === "published"
                          ? "bg-success/10 border border-success/30 text-success hover:bg-success/20"
                          : "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                      }`}
                    >
                      <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">
                        {publishing === catalog.id
                          ? "..."
                          : catalog.status === "published"
                          ? t("manageCatalogPage.unpublish") || "Unpub"
                          : t("manageCatalogPage.publish") || "Pub"}
                      </span>
                      <span className="sm:hidden">
                        {publishing === catalog.id ? "..." : catalog.status === "published" ? "✓" : "+"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
