export default function SignupSkeleton() {
  return (
    <div className="bg-background rounded-2xl shadow-lg border border-border overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-background-secondary sm:px-8 py-8">
        {/* Step Indicator Skeleton */}
        <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              {/* Circle */}
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" />
              {/* Label */}
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
        {/* Progress Line */}
        <div className="mt-4 h-1 bg-gray-300 dark:bg-gray-700 rounded-full max-w-2xl mx-auto" />
      </div>

      {/* Content Skeleton */}
      <div className="px-6 sm:px-8 py-8">
        <div className="min-h-[400px] space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded-lg" />
        </div>

        {/* Navigation Skeleton */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:flex-1 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="sm:flex-1 h-12 bg-primary/30 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
