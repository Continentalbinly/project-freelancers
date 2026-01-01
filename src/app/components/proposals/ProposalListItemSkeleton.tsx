"use client";

export default function ProposalListItemSkeleton() {
  return (
    <div className="px-3 sm:px-4 py-3 border-t border-border/60 dark:border-gray-700/60 first:border-t-0 animate-pulse">
      {/* Desktop Layout: Single Row */}
      <div className="hidden md:flex items-center gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-6 h-6 bg-background-tertiary dark:bg-gray-700 rounded-full" />
        </div>

        {/* Left: Name, Project Title, Time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
            <div className="h-3 w-40 bg-background-tertiary dark:bg-gray-700 rounded hidden lg:block" />
          </div>
          <div className="h-3 w-20 bg-background-tertiary dark:bg-gray-700 rounded mt-1" />
        </div>

        {/* Middle: Budget + Duration */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="h-4 w-24 bg-background-tertiary dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-background-tertiary dark:bg-gray-700 rounded" />
        </div>

        {/* Right: Status Badge + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-6 w-20 bg-background-tertiary dark:bg-gray-700 rounded-full" />
          <div className="h-7 w-16 bg-background-tertiary dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Top Line: Avatar + Name/Title */}
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-6 h-6 bg-background-tertiary dark:bg-gray-700 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 w-32 bg-background-tertiary dark:bg-gray-700 rounded" />
            <div className="h-3 w-40 bg-background-tertiary dark:bg-gray-700 rounded mt-1" />
            <div className="h-3 w-20 bg-background-tertiary dark:bg-gray-700 rounded mt-1" />
          </div>
        </div>

        {/* Middle: Budget + Duration + Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-4 w-24 bg-background-tertiary dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-background-tertiary dark:bg-gray-700 rounded" />
          <div className="h-5 w-16 bg-background-tertiary dark:bg-gray-700 rounded-full ml-auto" />
        </div>

        {/* Bottom: Actions */}
        <div className="flex items-center gap-2">
          <div className="h-7 flex-1 min-w-[80px] bg-background-tertiary dark:bg-gray-700 rounded" />
          <div className="h-7 flex-1 min-w-[80px] bg-background-tertiary dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

