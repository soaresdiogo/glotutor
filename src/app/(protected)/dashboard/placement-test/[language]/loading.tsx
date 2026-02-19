export default function PlacementTestLoading() {
  return (
    <main className="mx-auto max-w-2xl flex-1 p-6">
      <div className="animate-pulse rounded-2xl border border-(--border) bg-(--bg-card) p-8">
        <div className="mb-4 h-6 w-2/3 rounded bg-(--border)" />
        <div className="mb-6 h-4 w-full rounded bg-(--border)" />
        <div className="h-12 w-full rounded-xl bg-(--border)" />
      </div>
    </main>
  );
}
