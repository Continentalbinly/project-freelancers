"use client";

export default function ProjectsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-background rounded-xl shadow-sm border border-border overflow-hidden flex flex-col"
          >
            <div className="relative h-40 sm:h-44 md:h-48 bg-background-tertiary" />
            <div className="p-4 flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-3/4 bg-background-tertiary rounded" />
                <div className="h-5 w-16 bg-background-tertiary rounded-full" />
              </div>
              <div className="h-4 w-full bg-background-tertiary rounded" />
              <div className="h-4 w-5/6 bg-background-tertiary rounded" />
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-background-tertiary" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-background-tertiary rounded" />
                  <div className="h-3 w-16 bg-background-tertiary rounded" />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="h-3 w-full bg-background-tertiary rounded" />
                <div className="h-3 w-5/6 bg-background-tertiary rounded" />
                <div className="h-3 w-2/3 bg-background-tertiary rounded" />
                <div className="h-3 w-1/2 bg-background-tertiary rounded" />
              </div>
              <div className="h-9 w-full bg-background-tertiary rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
