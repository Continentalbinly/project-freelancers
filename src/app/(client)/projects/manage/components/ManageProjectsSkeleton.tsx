"use client";

export default function ManageProjectsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="border border-border rounded-xl bg-background p-5 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-background-tertiary rounded" />
              <div className="h-4 w-full bg-background-tertiary rounded" />
              <div className="h-4 w-5/6 bg-background-tertiary rounded" />
              <div className="flex gap-2 mt-3">
                <div className="h-6 w-20 bg-background-tertiary rounded-full" />
                <div className="h-6 w-16 bg-background-tertiary rounded-full" />
                <div className="h-6 w-24 bg-background-tertiary rounded-full" />
              </div>
            </div>
            <div className="w-28 space-y-2">
              <div className="h-6 bg-background-tertiary rounded" />
              <div className="h-4 bg-background-tertiary rounded" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <div className="h-6 w-16 bg-background-tertiary rounded-full" />
            <div className="h-6 w-14 bg-background-tertiary rounded-full" />
            <div className="h-6 w-20 bg-background-tertiary rounded-full" />
            <div className="h-6 w-10 bg-background-tertiary rounded-full" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex gap-3">
              <div className="h-4 w-24 bg-background-tertiary rounded" />
              <div className="h-4 w-20 bg-background-tertiary rounded" />
            </div>
            <div className="h-4 w-24 bg-background-tertiary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
