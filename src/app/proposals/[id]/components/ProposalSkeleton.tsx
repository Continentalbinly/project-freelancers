"use client";

export default function ProposalSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Info Card */}
            <div className="border border-border bg-background p-6">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div className="flex-1 min-w-[250px] space-y-3">
                  <div className="h-6 w-3/4 bg-background-tertiary rounded" />
                  <div className="h-4 w-full bg-background-tertiary rounded" />
                  <div className="h-4 w-5/6 bg-background-tertiary rounded" />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className="h-6 w-16 bg-background-tertiary rounded-md" />
                    <div className="h-6 w-20 bg-background-tertiary rounded-md" />
                    <div className="h-6 w-14 bg-background-tertiary rounded-md" />
                  </div>
                </div>
                <div className="text-right min-w-[120px] space-y-2">
                  <div className="h-7 w-24 bg-background-tertiary rounded ml-auto" />
                  <div className="h-3 w-20 bg-background-tertiary rounded ml-auto" />
                </div>
              </div>
              <div className="h-7 w-24 bg-background-tertiary rounded-full" />
            </div>

            {/* Cover Letter Card */}
            <div className="border border-border bg-background rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 bg-background-tertiary rounded" />
                <div className="h-5 w-32 bg-background-tertiary rounded" />
              </div>
              <div className="border-l-2 border-background-tertiary pl-4 space-y-2">
                <div className="h-4 w-full bg-background-tertiary rounded" />
                <div className="h-4 w-full bg-background-tertiary rounded" />
                <div className="h-4 w-3/4 bg-background-tertiary rounded" />
              </div>
            </div>

            {/* Milestones Card */}
            <div className="border border-border bg-background rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-5 bg-background-tertiary rounded" />
                <div className="h-5 w-28 bg-background-tertiary rounded" />
              </div>
              <div className="divide-y divide-border space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="pt-3 flex justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 bg-background-tertiary rounded" />
                      <div className="h-3 w-64 bg-background-tertiary rounded" />
                    </div>
                    <div className="h-3 w-20 bg-background-tertiary rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Work Samples Card */}
            <div className="border border-border bg-background rounded-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-5 w-5 bg-background-tertiary rounded" />
                <div className="h-5 w-32 bg-background-tertiary rounded" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-background-tertiary rounded-md border border-border"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="space-y-6">
            {/* Freelancer/Client Card */}
            <div className="border border-border bg-background rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-background-tertiary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-background-tertiary rounded" />
                  <div className="h-3 w-24 bg-background-tertiary rounded" />
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-background-tertiary rounded" />
                  <div className="h-4 w-28 bg-background-tertiary rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-background-tertiary rounded" />
                  <div className="h-4 w-36 bg-background-tertiary rounded" />
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="border border-border bg-background rounded-lg p-6 space-y-4">
              <div className="h-5 w-28 bg-background-tertiary rounded" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-background-tertiary rounded" />
                    <div className="h-4 w-32 bg-background-tertiary rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="h-11 w-full bg-background-tertiary rounded-lg" />
              <div className="h-11 w-full bg-background-tertiary rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
