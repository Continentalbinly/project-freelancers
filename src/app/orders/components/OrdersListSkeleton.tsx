"use client";

export default function OrdersListSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 bg-background-tertiary rounded mb-2"></div>
          <div className="h-4 w-96 bg-background-tertiary rounded"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-background-secondary">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-background-tertiary rounded"></div>
                  <div className="h-8 w-16 bg-background-tertiary rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-background-tertiary"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6 w-full">
          <div className="h-12 w-full bg-background-tertiary rounded-lg"></div>
        </div>

        {/* Status Tabs Skeleton */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-10 w-24 bg-background-tertiary rounded-lg"></div>
          ))}
        </div>

        {/* Orders List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-border rounded-xl p-5 bg-background-secondary">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex-1 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background-tertiary shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-background-tertiary rounded"></div>
                    <div className="flex gap-4">
                      <div className="h-4 w-20 bg-background-tertiary rounded"></div>
                      <div className="h-4 w-24 bg-background-tertiary rounded"></div>
                      <div className="h-4 w-20 bg-background-tertiary rounded"></div>
                    </div>
                  </div>
                </div>
                {/* Right: Status & Arrow */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="h-7 w-20 bg-background-tertiary rounded-full"></div>
                  <div className="w-5 h-5 bg-background-tertiary rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
