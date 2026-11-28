import { useEffect, useState } from 'react';
import { stockMarketAPI } from '@/services/stockMarketAPI';
import { sparklinePath } from '@/lib/chart';

const W = 160;
const H = 48;

/**
 * Decorative one-month close line. Loads after the card renders and fails silently:
 * the card stays complete without it. Neutral color on purpose; the card's PriceChange shows direction.
 */
export function Sparkline({ symbol }: { symbol: string }) {
  const [path, setPath] = useState('');

  useEffect(() => {
    let stale = false;
    stockMarketAPI.getHistory(symbol, '1mo', '1d').then(
      (h) => !stale && setPath(sparklinePath(h.data.candles.map((c) => c.c), W, H, 2)),
      () => undefined,
    );
    return () => {
      stale = true;
    };
  }, [symbol]);

  if (!path) return null;
  return (
    <div aria-hidden="true" className="flex items-end gap-2 text-muted-foreground sm:justify-end">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="max-w-full">
        <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span className="text-xs">1M</span>
    </div>
  );
}
