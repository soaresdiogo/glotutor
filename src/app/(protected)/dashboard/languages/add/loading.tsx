export default function AddLanguageLoading() {
  return (
    <main className="mx-auto max-w-4xl flex-1 p-6">
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-(--border)" />
      <div className="mb-2 h-8 w-48 animate-pulse rounded bg-(--border)" />
      <div className="mb-8 h-4 w-96 animate-pulse rounded bg-(--border)" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-(--border)"
          />
        ))}
      </div>
    </main>
  );
}
