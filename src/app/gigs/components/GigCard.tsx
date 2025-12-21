"use client";

import { useRouter } from "next/navigation";
import Avatar, { getAvatarProps } from "@/app/utils/avatarHandler";
import { formatLAK } from "@/service/currencyUtils";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { timeAgo } from "@/service/timeUtils";
import {
  ClockIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArrowRightIcon,
  CubeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import type { Catalog } from "@/types/catalog";

interface GigCardProps {
  gig: Catalog;
  ownerProfile?: {
    fullName: string;
    avatarUrl?: string;
    rating?: number;
    totalRatings?: number;
  };
  categoryName: string;
  currentImageIndex: number;
  onImageChange?: (gigId: string, index: number) => void;
}

export default function GigCard({
  gig,
  ownerProfile,
  categoryName,
  currentImageIndex,
  onImageChange,
}: GigCardProps) {
  const { t, currentLanguage } = useTranslationContext();
  const router = useRouter();

  const images = gig.images || [];
  const packages = gig.packages || [];
  const tags = gig.tags || [];

  // Calculate price range
  const prices = packages.map((p) => p.price || 0).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const hasPriceRange = minPrice !== maxPrice && prices.length > 1;

  const formatPrice = (price: number) => {
    return formatLAK(price, { compact: true });
  };

  const handleCardClick = (e?: React.MouseEvent) => {
    const target = e?.target as HTMLElement;
    if (target?.closest("button") || target?.closest("a")) return;
    router.push(`/catalog/${gig.id}`);
  };

  const handleImageIndicatorClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageChange) {
      onImageChange(gig.id, index);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-background rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* 🖼️ Image with Gradient Overlay */}
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-linear-to-br from-primary/5 via-secondary/5 to-primary/5">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex] || images[0]}
              alt={gig.title || "Gig image"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleImageIndicatorClick(index, e)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CubeIcon className="w-16 h-16 text-primary/30" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
          {/* Category Badge */}
          {categoryName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/90 backdrop-blur-sm text-white border border-primary/20">
              <TagIcon className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{categoryName}</span>
            </div>
          )}
        </div>

        {/* Price Badge at bottom */}
        {minPrice > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="font-bold text-sm sm:text-base">
                {hasPriceRange
                  ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                  : formatPrice(minPrice)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 📄 Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Title & Description */}
        <div className="mb-3">
          <h3 className="font-bold text-lg sm:text-xl text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {gig.description}
          </p>
        </div>

        {/* Details Section with Gradient */}
        <div className="relative mb-4 rounded-xl overflow-hidden bg-linear-to-b from-primary/5 via-secondary/5 to-primary/5 p-4">
          {/* Owner Info */}
          {ownerProfile && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar
                {...getAvatarProps({
                  fullName: ownerProfile.fullName,
                  avatarUrl: ownerProfile.avatarUrl,
                })}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-text-primary truncate">
                    {ownerProfile.fullName}
                  </span>
                  {ownerProfile.rating && ownerProfile.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-600 text-xs whitespace-nowrap">
                      <StarIconSolid className="w-3.5 h-3.5 fill-current" />
                      <span className="font-medium">
                        {ownerProfile.rating.toFixed(1)}
                      </span>
                    </span>
                  )}
                </div>
                {ownerProfile.totalRatings && ownerProfile.totalRatings > 0 && (
                  <p className="text-xs text-text-secondary">
                    {ownerProfile.totalRatings}{" "}
                    {t("common.ratings") || "ratings"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Packages Count */}
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CubeIcon className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-text-primary text-xs">
                  {t("gigsPage.packages") || "Packages"}
                </h4>
              </div>
              <p className="text-sm text-text-primary font-medium">
                {packages.length}
              </p>
            </div>

            {/* Posted Date */}
            {gig.createdAt && (
              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ClockIcon className="w-4 h-4 text-secondary" />
                  <h4 className="font-semibold text-text-primary text-xs">
                    {t("common.createdAt") || "Created"}
                  </h4>
                </div>
                <p className="text-sm text-text-primary font-medium line-clamp-1">
                  {timeAgo(gig.createdAt, currentLanguage)}
                </p>
              </div>
            )}

            {/* Rating */}
            {gig.rating && gig.rating > 0 && (
              <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <StarIcon className="w-4 h-4 text-amber-600" />
                  <h4 className="font-semibold text-text-primary text-xs">
                    {t("common.rating") || "Rating"}
                  </h4>
                </div>
                <p className="text-sm text-text-primary font-medium">
                  {gig.rating.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tags Preview */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-background-secondary text-text-secondary border border-border">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/catalog/${gig.id}`);
          }}
          className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm shadow-sm hover:shadow-md group/btn"
        >
          <span>{t("gigsPage.viewDetails") || "View Details"}</span>
          <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

