"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Catalog } from "@/types/catalog";
import { Package as PackageIcon, DollarSign } from "lucide-react";

interface ProfileCatalogsSectionProps {
  profileId: string;
}

export default function ProfileCatalogsSection({ profileId }: ProfileCatalogsSectionProps) {
  const { t, currentLanguage } = useTranslationContext();
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(requireDb(), "catalogs"),
      where("ownerId", "==", profileId),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Catalog[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: data.ownerId || "",
            title: data.title || "",
            description: data.description || "",
            images: Array.isArray(data.images) ? data.images : [],
            category: data.category || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            packages: Array.isArray(data.packages) ? data.packages : [],
            status: data.status || "draft",
            rating: data.rating,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as Catalog;
        });
        setCatalogs(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching catalogs:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [profileId]);

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Uncategorized";
    return categoryId;
  };

  if (loading) {
    return (
      <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
            {t("profile.catalogs.title") || "My Services"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden bg-background animate-pulse">
              <div className="h-40 bg-background-secondary"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-background-secondary rounded w-3/4"></div>
                <div className="h-3 bg-background-secondary rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (catalogs.length === 0) return null;

  return (
    <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
          {t("profile.catalogs.title") || "My Services"}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {catalogs.map((catalog) => (
          <div
            key={catalog.id}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/catalog/${catalog.id}`);
            }}
            className="group border border-border dark:border-gray-700/50 rounded-xl overflow-hidden bg-background hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/catalog/${catalog.id}`);
              }
            }}
          >
            {/* Cover Image */}
            <div className="h-40 bg-linear-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
              {catalog.images?.[0] ? (
                <img
                  src={catalog.images[0]}
                  alt={catalog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PackageIcon className="w-10 h-10 text-primary/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title & Category */}
              <div>
                <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                  {catalog.title}
                </h3>
                {catalog.category && (
                  <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 mt-1">
                    {getCategoryName(catalog.category)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-text-secondary line-clamp-2">{catalog.description}</p>

              {/* Tags */}
              {(catalog.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {catalog.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-background-secondary dark:bg-gray-800/50 border border-border/50 text-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                  {catalog.tags.length > 3 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-background-secondary dark:bg-gray-800/50 border border-border/50 text-text-secondary">
                      +{catalog.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Price & Action */}
              <div className="pt-3 border-t border-border dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-text-primary">
                    From {Math.min(...(catalog.packages || []).map(p => p.price || 0)).toLocaleString()} LAK
                  </span>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-all">
                  {t("gigsPage.view") || "View"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

