export default function LevelProgressLoading() {
  return (
    <main className="mx-auto max-w-3xl flex-1 p-6">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-(--border)" />
      <div className="mb-8 h-8 w-64 animate-pulse rounded bg-(--border)" />
      <div className="mb-8 h-28 w-28 animate-pulse rounded-full bg-(--border)" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-(--border)"
          />
        ))}
      </div>
    </main>
  );
}
