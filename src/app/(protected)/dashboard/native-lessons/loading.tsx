export default function NativeLessonsLoading() {
  return (
    <main className="p-6 md:p-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-(--bg-elevated)" />
      <div className="mb-6 h-16 w-full animate-pulse rounded-xl bg-(--bg-elevated)" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li
            key={i}
            className="h-40 animate-pulse rounded-xl bg-(--bg-elevated)"
          />
        ))}
      </ul>
    </main>
  );
}
