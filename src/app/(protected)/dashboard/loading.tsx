export default function DashboardLoading() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-(--border) border-t-(--accent)"
          aria-hidden
        />
        <p className="text-sm text-(--text-muted)">Loading…</p>
      </div>
    </main>
  );
}
