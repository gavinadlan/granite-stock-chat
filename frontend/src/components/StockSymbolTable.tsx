import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { US_STOCKS, searchUSStocks } from '@/lib/usStocks';

const SECTORS = [...new Set(US_STOCKS.flatMap((s) => s.sector ?? []))].sort();

/** Searchable symbol list, shown inside the stock sheet. */
export function StockSymbolTable({ onSelectSymbol }: { onSelectSymbol: (symbol: string) => void }) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');

  const stocks = useMemo(
    () => (query ? searchUSStocks(query) : US_STOCKS).filter((s) => !sector || s.sector === sector),
    [query, sector],
  );

  return (
    <>
      <div className="space-y-2 border-b p-4">
        <Input
          type="search"
          aria-label="Search stocks"
          placeholder="Symbol or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="h-10 w-full rounded-control border border-input bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground" role="status">
          {stocks.length} US {stocks.length === 1 ? 'stock' : 'stocks'}. For IDX stocks, type the ticker with .JK in chat.
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            <button
              type="button"
              onClick={() => onSelectSymbol(stock.symbol)}
              className="w-full rounded-control px-2 py-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="font-medium">{stock.symbol}</span>
              <span className="block text-sm text-muted-foreground">{stock.companyName}</span>
            </button>
          </li>
        ))}
        {stocks.length === 0 && <li className="p-4 text-center text-muted-foreground">No stocks match this search.</li>}
      </ul>
    </>
  );
}
