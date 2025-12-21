"use client";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-secondary via-secondary to-secondary-hover text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-white/20 rounded w-64 mb-3"></div>
          <div className="h-6 bg-white/20 rounded w-96"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-secondary rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="h-4 bg-background-tertiary rounded w-24 mb-4"></div>
              <div className="h-8 bg-background-tertiary rounded w-32 mb-2"></div>
              <div className="h-3 bg-background-tertiary rounded w-40"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-8">
          <div className="h-6 bg-background-tertiary rounded w-40 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-background-secondary rounded-lg p-4 border border-border shadow-sm"
              >
                <div className="h-12 w-12 bg-background-tertiary rounded-lg mb-3 mx-auto"></div>
                <div className="h-4 bg-background-tertiary rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Items Skeleton */}
        <div>
          <div className="h-6 bg-background-tertiary rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="h-5 bg-background-tertiary rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-background-tertiary rounded w-full mb-2"></div>
                <div className="h-4 bg-background-tertiary rounded w-5/6 mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-background-tertiary rounded w-24"></div>
                  <div className="h-6 bg-background-tertiary rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

