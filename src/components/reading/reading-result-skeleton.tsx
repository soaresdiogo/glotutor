'use client';

export function ReadingResultSkeleton() {
  return (
    <div className="space-y-6" aria-hidden aria-busy="true">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-(--border) bg-(--bg-card) px-4 py-4 text-center"
          >
            <div className="mx-auto mb-1 h-8 w-12 animate-pulse rounded bg-(--bg-elevated)" />
            <div className="mx-auto h-3 w-16 animate-pulse rounded bg-(--bg-elevated)" />
          </div>
        ))}
      </div>

      {/* Feedback card */}
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-(--bg-elevated)" />
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-(--bg-elevated)" />
          <div className="h-4 w-full max-w-[90%] animate-pulse rounded bg-(--bg-elevated)" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-(--bg-elevated)" />
        </div>
        <div className="mb-5 space-y-2">
          <div className="h-12 w-full animate-pulse rounded-lg bg-(--bg-elevated)" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-(--bg-elevated)" />
        </div>
        <div className="mb-2 h-3 w-32 animate-pulse rounded bg-(--bg-elevated)" />
        <div className="h-2 w-full animate-pulse rounded-full bg-(--bg-elevated)" />
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-8 animate-pulse rounded bg-(--bg-elevated)" />
          <div className="h-3 w-8 animate-pulse rounded bg-(--bg-elevated)" />
        </div>
      </div>

      {/* Grammar card */}
      <div className="rounded-xl border border-(--border) bg-(--bg-card) p-6">
        <div className="mb-4 h-6 w-56 animate-pulse rounded bg-(--bg-elevated)" />
        <div className="space-y-4">
          <div>
            <div className="mb-2 inline-block h-5 w-24 animate-pulse rounded-full bg-(--bg-elevated)" />
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded-lg bg-(--bg-elevated)" />
              <div className="h-20 w-full animate-pulse rounded-lg bg-(--bg-elevated)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
