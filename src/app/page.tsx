"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LandingPage from "./components/landing/LandingPage";

export default function Home(): React.ReactElement {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [, setShowTimeout] = useState(false);

  // 🔐 Role-based redirect for logged-in users (optimized - no loading delays)
  useEffect(() => {
    if (loading) return; // Still checking auth state
    
    if (!user) {
      // Reset redirect flag when user logs out
      hasRedirected.current = false;
      setShowTimeout(false);
      return; // Not logged in, show landing page
    }
    
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // ✅ Optimized: Redirect immediately if we have profile, otherwise redirect to dashboard
    // This avoids showing loading states - dashboard will handle its own loading
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      
      if (profile?.role) {
        // We have profile with role - redirect based on role
        const role = profile.role;
        if (role === "client") {
          router.replace("/gigs");
        } else if (role === "freelancer") {
          router.replace("/projects");
        } else {
          router.replace("/dashboard");
        }
      } else {
        // No profile yet - redirect to dashboard anyway (it will handle loading)
        // This is faster than waiting for profile here
        router.replace("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  // ✅ Optimized: Show landing page immediately if not logged in
  // If logged in, redirect happens in useEffect (no loading screen needed)
  if (!user && !loading) {
    return <LandingPage />;
  }

  // ✅ Show landing page skeleton during logout or initial auth check when not logged in
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section Skeleton */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950/20 py-20 sm:py-24 lg:py-28 overflow-hidden animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Title Skeleton */}
            <div className="mb-6">
              <div className="h-12 sm:h-14 lg:h-16 bg-background-secondary dark:bg-gray-800 rounded-lg w-3/4 max-w-3xl mx-auto mb-4"></div>
              <div className="h-10 sm:h-12 lg:h-14 bg-background-secondary dark:bg-gray-800 rounded-lg w-2/3 max-w-2xl mx-auto"></div>
            </div>
            
            {/* Subtitle Skeleton */}
            <div className="mb-10">
              <div className="h-6 sm:h-7 lg:h-8 bg-background-secondary dark:bg-gray-800 rounded w-full max-w-4xl mx-auto mb-3"></div>
              <div className="h-6 sm:h-7 lg:h-8 bg-background-secondary dark:bg-gray-800 rounded w-5/6 max-w-3xl mx-auto"></div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="h-14 bg-background-secondary dark:bg-gray-800 rounded-xl"></div>
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <div className="h-12 w-48 bg-background-secondary dark:bg-gray-800 rounded-lg mx-auto sm:mx-0"></div>
              <div className="h-12 w-48 bg-background-secondary dark:bg-gray-800 rounded-lg mx-auto sm:mx-0"></div>
            </div>
          </div>
        </section>

        {/* Top Categories Skeleton */}
        <section className="py-12 sm:py-16 bg-background animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-background-secondary dark:bg-gray-800 rounded-lg w-64 mb-8 mx-auto"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-background-secondary dark:bg-gray-800 rounded-full mb-3"></div>
                  <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Skeleton */}
        <section className="py-16 sm:py-20 bg-background-secondary dark:bg-gray-900/50 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 bg-background-tertiary dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-background-tertiary dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section Skeleton */}
        <section className="py-16 sm:py-20 bg-background animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 bg-background-secondary dark:bg-gray-800 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-5 bg-background-secondary dark:bg-gray-800 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 rounded-xl bg-background-secondary dark:bg-gray-800">
                  <div className="w-12 h-12 bg-background-tertiary dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ✅ Minimal loading only during initial auth check when logged in
  // Once we know user status, redirect immediately (no waiting for profile)
  // Show gigs page skeleton loading for better UX
  if (loading || user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 bg-background-tertiary dark:bg-gray-700 rounded-lg w-48 mb-2"></div>
            <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-96"></div>
          </div>

          {/* Search Bar & Filters Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 h-12 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
            <div className="h-12 w-32 bg-background-tertiary dark:bg-gray-700 rounded-lg"></div>
          </div>

          {/* Category Filters Skeleton */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-24 bg-background-tertiary dark:bg-gray-700 rounded-full"></div>
            ))}
          </div>

          {/* Gigs Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border border-border dark:border-gray-700 rounded-xl overflow-hidden bg-background-secondary dark:bg-gray-800">
                {/* Cover Image Skeleton */}
                <div className="h-40 bg-background-tertiary dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  {/* Owner Info Skeleton */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50 dark:border-gray-700/50">
                    <div className="w-6 h-6 rounded-full bg-background-tertiary dark:bg-gray-700"></div>
                    <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded"></div>
                  </div>
                  
                  {/* Title & Category Skeleton */}
                  <div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
                  </div>
                  
                  {/* Description Skeleton */}
                  <div className="space-y-2">
                    <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-background-tertiary dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  
                  {/* Tags Skeleton */}
                  <div className="flex gap-2">
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-20"></div>
                    <div className="h-5 bg-background-tertiary dark:bg-gray-700 rounded-full w-14"></div>
                  </div>
                  
                  {/* Price & Action Skeleton */}
                  <div className="flex items-center justify-between pt-3 border-t border-border dark:border-gray-700">
                    <div className="h-4 bg-background-tertiary dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-7 bg-background-tertiary dark:bg-gray-700 rounded-lg w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't reach here)
  return <LandingPage />;
}
