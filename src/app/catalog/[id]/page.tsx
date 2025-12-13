"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/service/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Catalog } from "@/types/catalog";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import CatalogDetailSkeleton from "./components/CatalogDetailSkeleton";
import HeroSection from "./components/HeroSection";
import OwnerProfileCard from "./components/OwnerProfileCard";
import DescriptionSection from "./components/DescriptionSection";
import GallerySection from "./components/GallerySection";
import CheckoutModal from "./components/CheckoutModal";
import { Check, RotateCcw } from "lucide-react";

interface OwnerProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  rating: number;
  totalRatings: number;
  projectsCompleted: number;
}

export default function CatalogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { currentLanguage, t } = useTranslationContext();
  const [item, setItem] = useState<Catalog | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "catalogs", id));
      if (snap.exists()) {
        const data = snap.data() as any;
        // Don't store the ID in the item object
        const catalogItem = {
          ...data,
          id: snap.id,
        } as Catalog;
        setItem(catalogItem);

        // Fetch category name
        if (data.category) {
          const catSnap = await getDoc(doc(db, "categories", data.category));
          if (catSnap.exists()) {
            const catData = catSnap.data();
            setCategoryName(
              currentLanguage === "lo"
                ? catData.name_lo || catData.name_en
                : catData.name_en || ""
            );
          }
        }

        // Fetch owner profile
        if (data.ownerId) {
          const ownerSnap = await getDoc(doc(db, "profiles", data.ownerId));
          if (ownerSnap.exists()) {
            const ownerData = ownerSnap.data();
            setOwner({
              id: ownerSnap.id,
              fullName: ownerData.fullName || "Unknown",
              avatarUrl: ownerData.avatarUrl || ownerData.profileImage || "/images/default-avatar.png",
              rating: ownerData.rating || 0,
              totalRatings: ownerData.totalRatings || 0,
              projectsCompleted: ownerData.projectsCompleted || 0,
            });
          }
        }
      }
      setLoading(false);
    };
    if (id) load();
  }, [id, currentLanguage]);

  if (loading) return <CatalogDetailSkeleton />;

  // Allow viewing if: (1) published, OR (2) user is the owner
  const isOwner = user && item?.ownerId === user.uid;
  const canView = item && (item.status === "published" || isOwner);

  if (!canView)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        Service not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background-secondary dark:from-background-dark dark:via-background-dark dark:to-background-secondary-dark">
      <div className="max-w-7xl mx-auto px-4">
        <HeroSection
          images={item.images || []}
          title={item.title}
          categoryName={categoryName}
          isOwner={!!isOwner}
          status={item.status}
          tags={item.tags || []}
          t={t}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-16">
          {/* Main Content - Larger */}
          <div className="lg:col-span-3 space-y-8">
            <DescriptionSection description={item.description} t={t} />
            <GallerySection images={item.images || []} t={t} />

            {/* Packages Section */}
            {item.packages && item.packages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                  {t("catalogDetail.availablePackages") || "Available Packages"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-primary/10 dark:from-primary-dark/20 to-secondary/5 dark:to-secondary-dark/10 border border-primary/20 dark:border-primary-dark/30 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col"
                    >
                      <div className="p-6 flex-1 overflow-y-auto">
                        <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                          {pkg.name}
                        </h3>
                        <div className="text-3xl font-bold text-primary dark:text-primary-dark mb-3">
                          {pkg.price?.toLocaleString()} LAK
                        </div>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
                          {t("catalogDetail.deliveryLabel")} {pkg.deliveryDays} {t("checkout.days") || "days"}
                        </p>

                        {pkg.revisionLimit !== undefined && (
                          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4 flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-rose-600" />
                            {t("catalogDetail.revisions") || "Revisions"}: {pkg.revisionLimit}
                          </p>
                        )}

                        <div className="space-y-3 pt-4 border-t border-border/50 dark:border-border-dark/50">
                          <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
                            {t("catalogDetail.includedFeatures")}
                          </h4>
                          <ul className="space-y-2">
                            {(pkg.features || []).map((feature, fidx) => (
                              <li key={fidx} className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full bg-success/20 dark:bg-success/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Check className="w-2.5 h-2.5 text-success" />
                                </div>
                                <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {!isOwner && (
                        <div className="p-6 border-t border-border/50 dark:border-border-dark/50">
                          <button
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setShowCheckout(true);
                            }}
                            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-2 px-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm"
                          >
                            {t("catalogDetail.orderNow")}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="space-y-4 sticky top-20">
              {owner && item.status === "published" && !isOwner && (
                <OwnerProfileCard owner={owner} t={t} />
              )}

              {isOwner && (
                <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark text-center">
                    {t("catalogDetail.catalogPreview")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPackage && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPackage(null);
          }}
          pkg={selectedPackage}
          catalogId={id}
          catalogTitle={item?.title || ""}
          categoryId={item?.category || ""}
          ownerId={item?.ownerId || ""}
          userId={user!.uid}
          t={t}
        />
      )}
    </div>
  );
}
