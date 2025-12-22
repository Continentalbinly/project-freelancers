"use client";

export default function OrderDetailSkeleton() {
  return (
    <div className="bg-background animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-3 w-20 bg-background-tertiary rounded"></div>
              <div className="h-8 w-2/3 bg-background-tertiary rounded"></div>
              <div className="h-4 w-1/3 bg-background-tertiary rounded"></div>
            </div>
            <div className="h-9 w-24 bg-background-tertiary rounded-lg"></div>
          </div>
        </div>

        {/* Progress Timeline Skeleton */}
        <div className="mb-8 bg-background-secondary rounded-xl p-6 border border-border">
          <div className="h-4 w-32 bg-background-tertiary rounded mb-4"></div>
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-background-tertiary"></div>
                <div className="h-3 w-16 bg-background-tertiary rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details Card Skeleton */}
            <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
              <div className="h-6 w-32 bg-background-tertiary rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background-tertiary shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-20 bg-background-tertiary rounded"></div>
                      <div className="h-5 w-28 bg-background-tertiary rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border space-y-2">
                <div className="h-3 w-24 bg-background-tertiary rounded"></div>
                <div className="h-4 w-full bg-background-tertiary rounded"></div>
                <div className="h-4 w-3/4 bg-background-tertiary rounded"></div>
              </div>
            </div>

            {/* Action Section Skeleton */}
            <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-background-tertiary rounded"></div>
                <div className="h-6 w-32 bg-background-tertiary rounded"></div>
              </div>
              <div className="h-4 w-full bg-background-tertiary rounded"></div>
              <div className="h-4 w-2/3 bg-background-tertiary rounded"></div>
              <div className="h-32 w-full bg-background-tertiary rounded-lg"></div>
              <div className="flex justify-end pt-4 border-t border-border">
                <div className="h-10 w-32 bg-background-tertiary rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Party Info Skeleton */}
            <div className="border border-border rounded-xl bg-background-secondary p-6">
              <div className="h-3 w-32 bg-background-tertiary rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-28 bg-background-tertiary rounded-lg"></div>
                  <div className="h-9 w-32 bg-background-tertiary rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-background-tertiary rounded"></div>
                  <div className="h-7 w-24 bg-background-tertiary rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Timeline Skeleton */}
            <div className="border border-border rounded-xl bg-background-secondary p-6">
              <div className="h-3 w-20 bg-background-tertiary rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-background-tertiary shrink-0 mt-2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-28 bg-background-tertiary rounded"></div>
                      <div className="h-3 w-20 bg-background-tertiary rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
