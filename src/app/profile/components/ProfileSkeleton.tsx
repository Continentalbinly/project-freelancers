"use client";

export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-xl shadow-sm border border-border dark:border-gray-800 p-6 sm:p-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar Skeleton */}
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-4">
          {/* Name Skeleton */}
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {/* Stats Skeleton */}
          <div className="flex gap-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border border-border dark:border-gray-800 rounded-xl overflow-hidden bg-background-secondary animate-pulse"
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex gap-2 mt-3">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CurrentItemsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-background-secondary rounded-lg p-4 border border-border dark:border-gray-800 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PublicProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section Skeleton */}
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-border dark:border-gray-700/50 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* Avatar Skeleton */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            {/* Main Content Skeleton */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              {/* Skills Skeleton */}
              <div className="pt-4 border-t border-border dark:border-gray-700/50">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-border dark:border-gray-700/50 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        {/* Portfolio Skeleton */}
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50">
          <PortfolioSkeleton />
        </div>

        {/* Projects/Catalogs Skeleton */}
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50 animate-pulse">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Skeleton */}
        <div className="bg-background-secondary dark:bg-gray-800/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border dark:border-gray-700/50 animate-pulse">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 sm:mb-6"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border-l-2 border-gray-300 dark:border-gray-600 pl-4 space-y-2">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

