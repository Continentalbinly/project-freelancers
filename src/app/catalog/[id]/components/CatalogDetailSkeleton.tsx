export default function CatalogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background-secondary dark:from-background-dark dark:via-background-dark dark:to-background-secondary-dark animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section Skeleton */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl mb-12 mt-6 bg-background-secondary dark:bg-gray-800" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-16">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description Section Skeleton */}
            <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="h-7 bg-background-secondary dark:bg-gray-800 rounded-lg w-1/3" />
              <div className="space-y-3">
                <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-full" />
                <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-full" />
                <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-5/6" />
                <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-4/6" />
              </div>
            </div>

            {/* Gallery Skeleton */}
            <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="h-7 bg-background-secondary dark:bg-gray-800 rounded-lg w-1/4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-background-secondary dark:bg-gray-800"
                  />
                ))}
              </div>
            </div>

            {/* Packages Section Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-background-secondary dark:bg-gray-800 rounded-lg w-1/2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-primary/10 dark:from-primary-dark/20 to-secondary/5 dark:to-secondary-dark/10 border border-primary/20 dark:border-primary-dark/30 rounded-2xl p-6 space-y-4"
                  >
                    <div className="h-6 bg-background-secondary dark:bg-gray-800 rounded w-3/4" />
                    <div className="h-8 bg-background-secondary dark:bg-gray-800 rounded w-1/2" />
                    <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-2/3" />
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded w-1/3" />
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-3 bg-background-secondary dark:bg-gray-800 rounded w-full" />
                      ))}
                    </div>
                    <div className="h-10 bg-background-secondary dark:bg-gray-800 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {/* Owner Card Skeleton */}
            <div className="bg-gradient-to-br from-primary/5 dark:from-primary-dark/10 to-secondary/5 dark:to-secondary-dark/10 border-2 border-primary/20 dark:border-primary-dark/30 rounded-2xl p-8 space-y-6">
              <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded-lg w-2/3 mx-auto" />
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-background-secondary dark:bg-gray-800 border-4 border-primary" />
                <div className="h-7 bg-background-secondary dark:bg-gray-800 rounded-lg w-1/2" />
              </div>
              <div className="h-16 bg-background-secondary dark:bg-gray-800 rounded-lg" />
              <div className="h-20 bg-background-secondary dark:bg-gray-800 rounded-xl" />
              <div className="h-4 bg-background-secondary dark:bg-gray-800 rounded-lg w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
