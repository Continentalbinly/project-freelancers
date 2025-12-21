"use client";

export default function ProjectDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6 animate-pulse">
          {/* Project Image */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-background-secondary dark:bg-gray-800 rounded-lg" />

          {/* Main Content Card */}
          <div className="p-6 rounded-lg shadow-sm border border-border dark:border-gray-800">
            {/* Header */}
            <div className="space-y-4 mb-6">
              <div className="h-8 w-3/4 bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 bg-background-secondary dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-32 bg-background-secondary dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-20 bg-background-secondary dark:bg-gray-800 rounded-full" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 mb-6">
              <div className="h-4 w-full bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="h-4 w-5/6 bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="h-4 w-4/6 bg-background-secondary dark:bg-gray-800 rounded" />
            </div>

            {/* Skills */}
            <div className="space-y-3 mb-6">
              <div className="h-5 w-32 bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 w-20 bg-background-secondary dark:bg-gray-800 rounded-full" />
                ))}
              </div>
            </div>

            {/* Attachments/Samples */}
            <div className="space-y-3">
              <div className="h-5 w-40 bg-background-secondary dark:bg-gray-800 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-background-secondary dark:bg-gray-800 rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="rounded-lg shadow-sm border border-border dark:border-gray-800 p-6">
            <div className="h-6 w-48 bg-background-secondary dark:bg-gray-800 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Skeleton */}
              <div className="flex items-center space-x-3 p-4 bg-background-secondary dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-background-tertiary dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-background-tertiary dark:bg-gray-700 rounded" />
                </div>
              </div>
              {/* Freelancer Skeleton */}
              <div className="flex items-center space-x-3 p-4 bg-background-secondary dark:bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-background-tertiary dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-background-tertiary dark:bg-gray-700 rounded" />
                  <div className="h-3 w-20 bg-background-tertiary dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Sidebar */}
        <div className="lg:col-span-1">
          <div className="flex flex-col space-y-6 lg:sticky lg:top-[100px] self-start animate-pulse">
            {/* Sidebar Card */}
            <div className="border border-border dark:border-gray-800 rounded-lg p-6 bg-background-secondary dark:bg-gray-800">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
                <div className="h-8 w-full bg-background-tertiary dark:bg-gray-700 rounded" />
                <div className="h-4 w-24 bg-background-tertiary dark:bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
                <div className="h-4 w-28 bg-background-tertiary dark:bg-gray-700 rounded" />
              </div>
            </div>

            {/* Actions Card */}
            <div className="border border-border dark:border-gray-800 rounded-lg p-6 bg-background-secondary dark:bg-gray-800">
              <div className="space-y-3">
                <div className="h-10 w-full bg-background-tertiary dark:bg-gray-700 rounded" />
                <div className="h-10 w-full bg-background-tertiary dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

