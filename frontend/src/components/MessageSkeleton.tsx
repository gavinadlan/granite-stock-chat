/** Placeholder shaped like an answer (one line of text plus a card) while data loads. */
export function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 motion-reduce:animate-none">
      <span className="sr-only">Fetching data…</span>
      <div className="h-4 w-56 rounded-sm bg-muted" aria-hidden="true" />
      <div className="max-w-xl space-y-4 rounded-card border p-4 sm:p-5" aria-hidden="true">
        <div className="h-5 w-24 rounded-sm bg-muted" />
        <div className="h-9 w-40 rounded-sm bg-muted" />
        <div className="h-4 w-full rounded-sm bg-muted" />
      </div>
    </div>
  );
}
