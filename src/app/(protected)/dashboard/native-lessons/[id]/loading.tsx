export default function LessonPlayerLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-(--bg-elevated)" />
      <div className="mb-8 h-24 w-full max-w-3xl animate-pulse rounded-xl bg-(--bg-elevated)" />
      <div className="mb-6 h-2 w-full max-w-3xl animate-pulse rounded-full bg-(--bg-elevated)" />
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-(--bg-elevated)" />
        <div className="h-48 animate-pulse rounded-xl bg-(--bg-elevated)" />
      </div>
    </main>
  );
}
