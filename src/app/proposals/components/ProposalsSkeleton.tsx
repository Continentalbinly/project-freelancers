"use client";
export default function ProposalsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">

      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-background rounded-xl sm:rounded-2xl border border-border p-5 sm:p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1 w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-background-tertiary rounded-full" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-5 bg-background-tertiary rounded w-3/4" />
                <div className="h-4 bg-background-tertiary rounded w-5/6" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="h-6 w-16 bg-background-tertiary rounded-full" />
                  <div className="h-6 w-14 bg-background-tertiary rounded-full" />
                  <div className="h-6 w-20 bg-background-tertiary rounded-full" />
                  <div className="h-6 w-10 bg-background-tertiary rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-3">
              <div className="h-8 w-24 bg-background-tertiary rounded-full" />
              <div className="space-y-2 text-right">
                <div className="h-5 w-24 bg-background-tertiary rounded" />
                <div className="h-3 w-20 bg-background-tertiary rounded" />
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-background-secondary rounded-xl p-3 space-y-2">
                <div className="h-4 w-24 bg-background-tertiary rounded" />
                <div className="h-3 w-20 bg-background-tertiary rounded" />
              </div>
            ))}
          </div>

          {/* Actions row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-border gap-3">
            <div className="h-4 w-28 bg-background-tertiary rounded" />
            <div className="h-9 w-32 bg-background-tertiary rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
