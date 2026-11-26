/** Financial disclaimer shown next to analysis/outlook content. `short` is the one-line composer version. */
export function Disclaimer({ short = false, className = '' }: { short?: boolean; className?: string }) {
  if (short) {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        Not financial advice · <span lang="id">Bukan nasihat keuangan</span>
      </p>
    );
  }
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      For information only, not financial advice. Do your own research before investing.{' '}
      <span lang="id">Bukan nasihat keuangan. Lakukan riset sendiri sebelum berinvestasi.</span>
    </p>
  );
}
