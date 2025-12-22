"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where, orderBy, DocumentData } from "firebase/firestore";
import { requireDb } from "@/service/firebase";
import type { Catalog } from "@/types/catalog";
import { Search, X, ChevronDown, Package as PackageIcon } from "lucide-react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import GigCard from "./components/GigCard";

interface Category {
  id: string;
  name_en: string;
  name_lo: string;
}

// Skeleton Component
function GigSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background-secondary dark:bg-gray-800 animate-pulse">
      {/* Cover Image */}
      <div className="h-40 bg-background-tertiary dark:bg-gray-700"></div>
      <div className="p-4 space-y-3">
        {/* Owner Info Skeleton */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <div className="w-6 h-6 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
          <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded"></div>
        </div>
        
        {/* Title & Category */}
        <div>
          <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-14"></div>
        </div>
        
        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
          <div className="h-7 bg-background-tertiary dark:bg-gray-700 rounded-lg w-16"></div>
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
  const [ownerProfiles, setOwnerProfiles] = useState<Map<string, { fullName: string; avatarUrl?: string; rating?: number; totalRatings?: number }>>(new Map());
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});

  const isFreelancer = profile?.role === "freelancer";

  // Fetch categories from database
  useEffect(() => {
    const q = query(collection(requireDb(), "categories"), orderBy("name_en", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const cats = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, name_en: data.name_en || "", name_lo: data.name_lo || "" } as Category;
      });
      setCategories(cats);
      setCategoriesLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch published catalogs and owner profiles
  useEffect(() => {
    const q = query(collection(requireDb(), "catalogs"), where("status", "==", "published"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const rows: Catalog[] = snap.docs.map((d) => {
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
      setItems(rows);
      
      // Fetch owner profiles for all catalogs
      const ownerMap = new Map<string, { fullName: string; avatarUrl?: string; rating?: number; totalRatings?: number }>();
      const uniqueOwnerIds = [...new Set(rows.map(item => item.ownerId).filter(Boolean))];
      
      // Fetch all owner profiles in parallel
      const ownerPromises = uniqueOwnerIds.map(async (ownerId) => {
        try {
          const ownerSnap = await getDoc(doc(requireDb(), "profiles", ownerId));
          if (ownerSnap.exists()) {
            const ownerData = ownerSnap.data();
            ownerMap.set(ownerId, {
              fullName: ownerData.fullName || "Unknown",
              avatarUrl: ownerData.avatarUrl || ownerData.profileImage,
              rating: ownerData.rating || 0,
              totalRatings: ownerData.totalRatings || 0,
            });
          }
        } catch {
        }
      });
      
      await Promise.all(ownerPromises);
      setOwnerProfiles(ownerMap);
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

  // Auto-carousel for gig cards
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    filtered.forEach((gig) => {
      const images = gig.images || [];
      if (images.length > 1) {
        const interval = setInterval(() => {
          setCardImageIndices((prev) => {
            const currentIndex = prev[gig.id] || 0;
            const nextIndex = (currentIndex + 1) % images.length;
            return { ...prev, [gig.id]: nextIndex };
          });
        }, 4000); // Change image every 4 seconds
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [filtered]);

  // Handle manual image change
  const handleImageChange = (gigId: string, index: number) => {
    setCardImageIndices((prev) => ({ ...prev, [gigId]: index }));
  };

  // Show skeleton during auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-9 w-64 bg-background-secondary dark:bg-gray-800 rounded mb-2" />
            <div className="h-5 w-96 bg-background-secondary dark:bg-gray-800 rounded" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 animate-pulse">
            <div className="flex-1 h-12 bg-background-secondary dark:bg-gray-800 rounded-lg" />
            <div className="h-12 w-24 bg-background-secondary dark:bg-gray-800 rounded-lg" />
          </div>

          {/* Gigs Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <GigSkeleton key={i} />
            ))}
          </div>
        </div>
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
                      ? "bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
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
                          ? "bg-linear-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
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
                  <span className="text-text-secondary shrink-0">-</span>
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
          <div className="rounded-xl border-2 border-dashed border-border bg-background py-16 text-center">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-secondary text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
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
              {filtered.map((gig) => {
                const ownerProfile = ownerProfiles.has(gig.ownerId)
                  ? ownerProfiles.get(gig.ownerId)!
                  : undefined;
                
                return (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    ownerProfile={ownerProfile}
                    categoryName={getCategoryName(gig.category)}
                    currentImageIndex={cardImageIndices[gig.id] || 0}
                    onImageChange={handleImageChange}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
