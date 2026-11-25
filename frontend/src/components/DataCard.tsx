/** Shared frame for every data card in the chat: one radius, thin border, no shadow. */
export function DataCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <article aria-label={label} className="w-full max-w-xl space-y-4 rounded-card border bg-card p-4 text-card-foreground sm:p-5">
      {children}
    </article>
  );
}

/** Label/value row; use inside a <dl>. */
export function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium tabular-nums [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

/** Bottom strip with source, timestamp and disclaimer. */
export function DataCardFooter({ children }: { children: React.ReactNode }) {
  return <footer className="space-y-2 border-t pt-3">{children}</footer>;
}
