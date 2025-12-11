"use client";

export default function MessagesSkeleton() {
  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-background animate-pulse">
      {/* Chat list */}
      <aside className="w-full lg:w-80 flex flex-col border-r border-border">
        {/* Header with fixed height matching ChatList */}
        <div className="h-16 flex items-center px-4 border-b border-border bg-background shadow-sm">
          <div className="h-10 w-full bg-background-tertiary rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 bg-background rounded-lg shadow-sm border border-border"
            >
              <div className="h-12 w-12 rounded-full bg-background-tertiary flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-4 w-32 bg-background-tertiary rounded" />
                <div className="h-3 w-40 bg-background-tertiary rounded" />
                <div className="h-3 w-24 bg-background-tertiary rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat room */}
      <main className="flex-1 flex flex-col">
        {/* Header with fixed height matching ChatRoom */}
        <div className="h-16 flex items-center gap-3 border-b border-border bg-background px-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-background-tertiary flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 w-32 bg-background-tertiary rounded" />
            <div className="h-3 w-48 bg-background-tertiary rounded" />
          </div>
        </div>

        {/* Status bar */}
        <div className="bg-background-secondary border-b border-border px-4 py-2 flex items-center justify-between">
          <div className="h-6 w-24 bg-background-tertiary rounded-full" />
          <div className="h-4 w-24 bg-background-tertiary rounded" />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-background-secondary px-4 py-4 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-2xl bg-background border border-border shadow-sm">
              <div className="h-4 w-32 bg-background-tertiary rounded" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-xs px-3 py-2 rounded-2xl bg-primary/10 shadow-sm">
              <div className="h-4 w-36 bg-background-tertiary rounded" />
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-xs px-3 py-2 rounded-2xl bg-background border border-border shadow-sm">
              <div className="h-4 w-24 bg-background-tertiary rounded" />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="h-16 flex items-center px-4 border-t border-border bg-background">
          <div className="h-10 w-full bg-background-tertiary rounded-full" />
        </div>
      </main>
    </div>
  );
}
