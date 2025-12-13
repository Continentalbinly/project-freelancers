"use client";

export default function MyProjectsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-background-tertiary rounded" />
        <div className="h-4 w-72 bg-background-tertiary rounded" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 sm:gap-3 border-b border-border pb-2 overflow-x-auto">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="px-5 py-3 bg-background rounded-t-lg shadow-sm flex items-center gap-2"
          >
            <div className="h-4 w-16 bg-background-tertiary rounded" />
            <div className="h-5 w-8 bg-background-tertiary rounded-full" />
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="border border-border rounded-xl bg-background shadow-sm overflow-hidden"
          >
            <div className="aspect-video bg-background-tertiary" />
            <div className="p-5 space-y-4">
              <div className="h-5 w-3/4 bg-background-tertiary rounded" />
              <div className="h-4 w-2/3 bg-background-tertiary rounded" />
              <div className="h-4 w-1/2 bg-background-tertiary rounded" />
              <div className="pt-3 border-t border-border">
                <div className="h-4 w-28 bg-background-tertiary rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
