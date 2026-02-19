export default function PathLoading() {
  return (
    <main className="mx-auto max-w-3xl flex-1 p-6">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-(--border)" />
      <div className="mb-8 h-4 w-full max-w-md animate-pulse rounded bg-(--border)" />
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-xl bg-(--border)"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-(--border)" />
    </main>
  );
}
