"use client";

import { useState, useEffect } from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  fallback?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
  fallback,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 🧩 Get initials
  const getInitials = (userName: string) =>
    userName
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const processedSrc = src || null;
  const initials = fallback || (name ? getInitials(name) : "U");

  // 💀 If image fails or no src → show initials
  if (!processedSrc || imageError) {
    return (
      <div
        className={`bg-primary text-white font-medium rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}
        title={alt || name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {/* 🌈 Skeleton shimmer while loading */}
      {imageLoading && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      )}

      <img
        src={processedSrc}
        alt={alt || name || "Avatar"}
        className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        title={alt || name}
      />
    </div>
  );
}

// ✅ CSS shimmer animation (Tailwind plugin style)
const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}
`;

// Inject shimmer style once (runtime-safe)
if (
  typeof document !== "undefined" &&
  !document.getElementById("avatar-shimmer-style")
) {
  const styleEl = document.createElement("style");
  styleEl.id = "avatar-shimmer-style";
  styleEl.innerHTML = shimmerStyle;
  document.head.appendChild(styleEl);
}

// Utility function
export function getAvatarProps(profile: any, user?: any) {
  return {
    src: profile?.avatarUrl,
    alt: profile?.fullName,
    name: profile?.fullName || user?.email || "User",
    fallback: profile?.fullName
      ? profile.fullName
          .split(" ")
          .map((word: string) => word.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U",
  };
}
