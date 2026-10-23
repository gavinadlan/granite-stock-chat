import { Info } from 'lucide-react';

/** Financial disclaimer shown next to analysis/outlook content. */
export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 ${className}`}>
      <Info className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>
        For information only, not financial advice. Do your own research before investing.
        <span lang="id" className="block">Bukan nasihat keuangan. Lakukan riset sendiri sebelum berinvestasi.</span>
      </span>
    </p>
  );
}
