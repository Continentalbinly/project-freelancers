"use client";

import { useEffect, useState } from "react";

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

const CLOUDINARY_BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/`;

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
  fallback,
}: AvatarProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const initials = fallback || getInitials(name || "U");

  const { w, h } = {
    sm: { w: 64, h: 64 },
    md: { w: 128, h: 128 },
    lg: { w: 256, h: 256 },
    xl: { w: 384, h: 384 },
    "2xl": { w: 512, h: 512 },
  }[size] || { w: 128, h: 128 };

  const getCloudPublicId = (path: string): string | null => {
    const match = path.match(/profileImage-[^/]+$/i);
    return match
      ? `profileimage/${match[0].replace(/\.[a-zA-Z]+$/, "")}`
      : null;
  };

  const normalizeSrc = (input?: string): string | null => {
    if (!input) return null;
    if (input.includes("firebasestorage.googleapis.com")) return input;
    if (input.includes("res.cloudinary.com")) return input;
    if (input.includes("/uploads/profileImage/"))
      return input.replace(/^https?:\/\/[^/]+/, "");
    return input;
  };

  // ✅ Use API to check file existence (no 404)
  useEffect(() => {
    const verifyImage = async () => {
      if (!src) return;
      const normalized = normalizeSrc(src)!;

      // Cloud / Firebase URLs skip checking
      if (normalized.startsWith("http")) {
        setCurrentSrc(normalized);
        return;
      }

      try {
        const res = await fetch(
          `/api/check-image?path=${encodeURIComponent(normalized)}`
        );
        const data = await res.json();

        if (data.exists) {
          setCurrentSrc(normalized);
        } else {
          const cloudId = getCloudPublicId(normalized);
          if (cloudId) {
            const cloudUrl = `${CLOUDINARY_BASE}f_auto,q_auto,c_fill,w_${w},h_${h}/${cloudId}`;
            setCurrentSrc(cloudUrl);
          } else {
            setImageError(true);
          }
        }
      } catch {
        setImageError(true);
      }
    };

    verifyImage();
  }, [src]);

  if (!currentSrc || imageError) {
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
      {imageLoading && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      )}
      <img
        src={currentSrc}
        alt={alt || name || "Avatar"}
        className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => setImageError(true)}
        title={alt || name}
        loading="lazy"
      />
    </div>
  );
}

function getInitials(userName: string) {
  return userName
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

if (
  typeof document !== "undefined" &&
  !document.getElementById("avatar-shimmer-style")
) {
  const styleEl = document.createElement("style");
  styleEl.id = "avatar-shimmer-style";
  styleEl.innerHTML = shimmerStyle;
  document.head.appendChild(styleEl);
}

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
