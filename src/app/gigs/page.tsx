"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/service/firebase";
import type { Catalog } from "@/types/catalog";
import { Search, X, ChevronDown, Package as PackageIcon, DollarSign, Star } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

// Skeleton Component
function GigSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background-secondary animate-pulse">
      <div className="h-40 bg-background"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-background rounded w-3/4"></div>
        <div className="h-3 bg-background rounded w-full"></div>
        <div className="h-3 bg-background rounded w-5/6"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-background rounded-full w-20"></div>
          <div className="h-6 bg-background rounded-full w-24"></div>
        </div>
        <div className="flex gap-2 pt-3">
          <div className="flex-1 h-8 bg-background rounded"></div>
          <div className="h-8 w-16 bg-background rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function GigsPage() {
  const { t, currentLanguage } = useTranslationContext();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Catalog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);

  const roles = profile?.userRoles || [];
  const types = profile?.userType || [];
  const isFreelancer = roles.includes("freelancer") || types.includes("freelancer");

  // Fetch categories from database
  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("name_en", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const cats = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Category));
      setCategories(cats);
      setCategoriesLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch published catalogs
  useEffect(() => {
    const q = query(collection(db, "catalogs"), where("status", "==", "published"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows as Catalog[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Redirect freelancers to manage their catalog instead of browsing gigs
  useEffect(() => {
    if (!authLoading && isFreelancer) {
      router.replace("/catalog/manage");
    }
  }, [authLoading, isFreelancer, router]);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Uncategorized";
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    return currentLanguage === "lo"
      ? cat.name_lo || cat.name_en
      : cat.name_en;
  };

  // Filter logic
  const filtered = useMemo(() => {
    return items.filter((gig) => {
      // Search filter
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        gig.title.toLowerCase().includes(searchLower) ||
        gig.description.toLowerCase().includes(searchLower) ||
        (gig.tags || []).some((t) => t.toLowerCase().includes(searchLower));

      // Category filter - compare by ID
      const matchesCategory = !selectedCategory || gig.category === selectedCategory;

      // Price filter - check minimum price from packages
      const minPrice = Math.min(...(gig.packages || []).map((p) => p.price || 0));
      const matchesPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [items, searchText, selectedCategory, priceRange]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
        <p className="mt-4 text-text-secondary text-sm">{t("common.loading")}</p>
      </div>
    );
  }

  if (isFreelancer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="p-6 rounded-xl border border-border shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{t("common.accessRestrictedTitle")}</h2>
          <p className="text-text-secondary text-sm">{t("common.freelancerRedirectCatalog")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t("gigsPage.title") || "Browse Gigs"}
          </h1>
          <p className="text-text-secondary">
            {t("gigsPage.subtitle") || "Discover services from talented freelancers"}
          </p>
        </div>

        {/* Search Bar & Filters Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("gigsPage.searchPlaceholder") || "Search gigs, tags, or services…"}
              className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm sm:text-base"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background-secondary rounded transition-all"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border-2 border-border rounded-lg bg-background hover:border-primary/50 transition-all flex items-center justify-center gap-2 font-medium whitespace-nowrap"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">{t("gigsPage.filters") || "Filters"}</span>
            <span className="sm:hidden text-xs">{t("gigsPage.filter") || "Filter"}</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-4 sm:p-5 rounded-xl border-2 border-border bg-background-secondary space-y-5">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3 text-sm">
                {t("gigsPage.category") || "Category"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    !selectedCategory
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                      : "bg-background border border-border text-text-primary hover:border-primary/30"
                  }`}
                >
                  {t("gigsPage.allCategories") || "All"}
                </button>
                {categoriesLoading ? (
                  <div className="text-xs text-text-secondary py-2">{t("gigsPage.loadingCategories") || "Loading categories..."}</div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                          : "bg-background border border-border text-text-primary hover:border-primary/30"
                      }`}
                    >
                      {currentLanguage === "lo" ? cat.name_lo || cat.name_en : cat.name_en}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3 text-sm">
                {t("gigsPage.priceRange") || "Price Range (LAK)"}
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])}
                    className="flex-1 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm"
                    placeholder={t("gigsPage.minPrice") || "Min"}
                  />
                  <span className="text-text-secondary flex-shrink-0">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], parseInt(e.target.value) || 500000)])}
                    className="flex-1 px-2 sm:px-3 py-2 border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm"
                    placeholder={t("gigsPage.maxPrice") || "Max"}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <GigSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-background-secondary/50 py-16 text-center">
            <PackageIcon className="w-12 h-12 text-text-secondary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t("gigsPage.noServicesFound") || "No Services Found"}
            </h3>
            <p className="text-text-secondary mb-6">
              {t("gigsPage.tryAdjustingFilters") || "Try adjusting your search or filters"}
            </p>
            <button
              onClick={() => {
                setSearchText("");
                setSelectedCategory(null);
                setPriceRange([0, 500000]);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              {t("gigsPage.clearFilters") || "Clear Filters"}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-text-secondary">
              {t("gigsPage.showingResults") || "Showing"}{" "}
              <span className="font-semibold text-text-primary">{filtered.length}</span> {t("gigsPage.of") || "of"}{" "}
              <span className="font-semibold text-text-primary">{items.length}</span> {t("gigsPage.services") || "services"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((gig) => (
                <Link
                  key={gig.id}
                  href={`/catalog/${gig.id}`}
                  className="group border border-border rounded-xl overflow-hidden bg-background-secondary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
                >
                  {/* Cover Image */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                    {gig.images?.[0] ? (
                      <img
                        src={gig.images[0]}
                        alt={gig.title}
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
                      <h3 className="font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors">
                        {gig.title}
                      </h3>
                      {gig.category && (
                        <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 mt-1">
                          {getCategoryName(gig.category)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-text-secondary line-clamp-2">{gig.description}</p>

                    {/* Tags */}
                    {(gig.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {gig.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs rounded-full bg-background border border-border/50 text-text-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                        {gig.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-background border border-border/50 text-text-secondary">
                            +{gig.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                          From {Math.min(...(gig.packages || []).map(p => p.price || 0)).toLocaleString()} LAK
                        </span>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-all">
                        {t("gigsPage.view") || "View"}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
