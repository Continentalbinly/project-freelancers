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
  const [verifying, setVerifying] = useState(true);

  const initials = fallback || getInitials(name || "U");


  const getCloudPublicId = (path: string): string | null => {
    const match = path.match(/profileImage-[^/]+$/i);
    return match
      ? `profileimage/${match[0].replace(/\.[a-zA-Z]+$/, "")}`
      : null;
  };

  const DEFAULT_AVATAR = "/images/assets/user.png";

  const normalizeSrc = (input?: string): string | null => {
    if (!input) return null;
    if (input.includes("firebasestorage.googleapis.com")) return input;
    if (input.includes("res.cloudinary.com")) return input;
    if (input.includes("/uploads/profileImage/")) {
      const publicId = getCloudPublicId(input);
      if (publicId && process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        return `${CLOUDINARY_BASE}${publicId}`;
      }
      return DEFAULT_AVATAR;
    }
    return input;
  };

  useEffect(() => {
    const loadImage = async () => {
      if (!src || src.trim() === "") {
        setVerifying(false);
        setImageError(true);
        return;
      }
      
      const normalized = normalizeSrc(src);
      
      if (!normalized) {
        setVerifying(false);
        setImageError(true);
        return;
      }

      if (normalized.startsWith("http")) {
        setCurrentSrc(normalized);
        setVerifying(false);
        return;
      }

      setCurrentSrc(normalized || DEFAULT_AVATAR);
      setVerifying(false);
    };

    loadImage();
  }, [src]);

  if (verifying) {
    return (
      <div
        className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
      </div>
    );
  }

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
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
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

import type { Profile } from "@/types/profile";
import type { User as FirebaseUser } from "firebase/auth";

type AvatarProfile = {
  avatarUrl?: string | null;
  fullName?: string | null;
};

type UserParam = 
  | FirebaseUser 
  | { uid?: string; email?: string | null }
  | null 
  | undefined;

export function getAvatarProps(
  profile: Profile | AvatarProfile | null | undefined,
  user?: UserParam
) {
  const avatarUrl = profile?.avatarUrl;
  const fullName = profile?.fullName;
  
  let userEmail: string | undefined = undefined;
  if (user) {
    if ('email' in user && user.email !== null && user.email !== undefined) {
      userEmail = user.email;
    }
  }
  
  return {
    src: avatarUrl === null ? undefined : avatarUrl,
    alt: fullName === null ? undefined : fullName,
    name: fullName || userEmail || "User",
    fallback: fullName
      ? fullName
          .split(" ")
          .map((word: string) => word.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U",
  };
}
