import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { NewsCard } from '@/components/NewsCard';
import { StockCard } from '@/components/StockCard';
import { TechnicalAnalysisCard } from '@/components/TechnicalAnalysisCard';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceChange } from '@/components/ui/price-change';
import { ApiError } from '@/services/apiClient';
import { stockMarketAPI, type NewsResult, type StockPrice, type TechnicalAnalysis } from '@/services/stockMarketAPI';
import { formatPrice } from '@/lib/currencyUtils';
import { formatSymbol } from '@/lib/symbolUtils';
import { formatWibDateTime } from '@/lib/time';
import { cn } from '@/lib/utils';

// The chart library is only downloaded on this page, after the quote header.
const PriceChart = lazy(() => import('@/components/PriceChart'));

/** Same rule as the backend SymbolSchema. */
const SYMBOL_RE = /^[A-Z0-9.\-^=]{1,15}$/;

type Load<T> = { status: 'loading' } | { status: 'error'; message: string; notFound?: boolean } | { status: 'ready'; value: T };

const toError = (err: unknown) => ({
  status: 'error' as const,
  message: err instanceof ApiError ? err.message : 'Unexpected error.',
  notFound: err instanceof ApiError && err.status === 404,
});

/** Load once per `key` (null = skip) with a retry callback; stale responses are ignored. */
function useLoad<T>(key: string | null, load: () => Promise<T>): [Load<T>, () => void] {
  const [state, setState] = useState<Load<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (key === null) return;
    let stale = false;
    setState({ status: 'loading' });
    loadRef.current().then((value) => !stale && setState({ status: 'ready', value }), (err) => !stale && setState(toError(err)));
    return () => {
      stale = true;
    };
  }, [key, attempt]);
  return [state, () => setAttempt((a) => a + 1)];
}

function Failed({ what, message, onRetry }: { what: string; message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded-card border bg-card p-4">
      <p className="text-muted-foreground">
        {what} is unavailable right now. {message}
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function NotFoundState({ symbol }: { symbol: string }) {
  return (
    <div className="space-y-4 py-16">
      <h1 className="font-display text-heading font-bold">Symbol not found</h1>
      <p className="text-muted-foreground">
        We could not find price data for <span className="font-medium text-foreground [overflow-wrap:anywhere]">{symbol || 'this symbol'}</span>. Check
        the ticker, for example AAPL, BBCA.JK or ^JKSE.
      </p>
      <Button variant="outline" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}

const TABS = ['Summary', 'News'] as const;
type Tab = (typeof TABS)[number];

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length : null;
    if (next === null) return;
    e.preventDefault();
    onChange(TABS[next]);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label="Stock details" className="flex gap-1 border-b">
      {TABS.map((t, i) => (
        <button
          key={t}
          ref={(el) => (refs.current[i] = el)}
          id={`tab-${t}`}
          role="tab"
          type="button"
          aria-selected={tab === t}
          aria-controls={`panel-${t}`}
          tabIndex={tab === t ? 0 : -1}
          onClick={() => onChange(t)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={cn(
            '-mb-px inline-flex min-h-11 items-center border-b-2 px-3 text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function NewsPanel({ symbol }: { symbol: string }) {
  const [news, retry] = useLoad<NewsResult>(symbol, () => stockMarketAPI.getMarketNews(symbol));
  if (news.status === 'loading') return <p className="text-muted-foreground">Loading news…</p>;
  if (news.status === 'error') return <Failed what="News" message={news.message} onRetry={retry} />;
  if (!news.value.news.length) return <p className="text-muted-foreground">No recent news found for {symbol}.</p>;
  return (
    <div className="space-y-3">
      {news.value.news.map((item) => (
        <NewsCard key={item.id} newsItem={item} />
      ))}
      <DataSourceBadge source={news.value.source} asOf={news.value.asOf} stale={news.value.stale} />
    </div>
  );
}

export default function StockDetail() {
  const { symbol: raw = '' } = useParams();
  const navigate = useNavigate();
  const symbol = formatSymbol(raw);
  const valid = SYMBOL_RE.test(symbol);
  const [tab, setTab] = useState<Tab>('Summary');
  const [newsOpened, setNewsOpened] = useState(false);

  // One canonical URL per symbol: /stock/bbca → /stock/BBCA.JK.
  useEffect(() => {
    if (valid && raw !== symbol) navigate(`/stock/${encodeURIComponent(symbol)}`, { replace: true });
  }, [valid, raw, symbol, navigate]);

  useEffect(() => {
    setTab('Summary');
    setNewsOpened(false);
  }, [symbol]);

  const [quote, retryQuote] = useLoad<StockPrice>(valid ? symbol : null, () => stockMarketAPI.getStockPrice(symbol));
  const [technicals, retryTechnicals] = useLoad<TechnicalAnalysis>(valid ? symbol : null, () => stockMarketAPI.getTechnicalAnalysis(symbol));

  const changeTab = (t: Tab) => {
    setTab(t);
    if (t === 'News') setNewsOpened(true);
  };

  const notFound = !valid || (quote.status === 'error' && quote.notFound);

  useEffect(() => {
    document.title = notFound ? 'Symbol not found · StockAI' : `${symbol} price chart · StockAI`;
  }, [notFound, symbol]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header sectionLinks={false} />
      <main className="mx-auto w-full max-w-[1248px] flex-1 space-y-6 px-4 pb-16 sm:px-6">
        {notFound ? (
          <NotFoundState symbol={valid ? symbol : raw} />
        ) : (
          <>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-control text-[15px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>

            <header className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <h1 className="font-display text-heading font-bold [overflow-wrap:anywhere]">
                  {symbol}
                  {quote.status === 'ready' && quote.value.name && (
                    <span className="block text-title font-semibold text-muted-foreground">{quote.value.name}</span>
                  )}
                </h1>
                {quote.status === 'loading' && <div className="h-10 w-48 rounded-control bg-muted motion-safe:animate-pulse" aria-hidden="true" />}
                {quote.status === 'ready' && (
                  <>
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-display font-semibold tabular-nums [overflow-wrap:anywhere]">{formatPrice(quote.value.price, quote.value.currency, quote.value.symbol)}</span>
                      <PriceChange change={quote.value.change} changePercent={quote.value.changePercent} currency={quote.value.currency} symbol={quote.value.symbol} className="font-medium" />
                      <Badge variant="secondary">{quote.value.delayed ? 'Delayed' : 'Live'}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Source: {quote.value.source}
                      {formatWibDateTime(quote.value.asOf) && (
                        <>
                          {' · '}
                          <time dateTime={quote.value.asOf}>{formatWibDateTime(quote.value.asOf)}</time>
                        </>
                      )}
                    </p>
                  </>
                )}
                {quote.status === 'error' && <Failed what="The quote" message={quote.message} onRetry={retryQuote} />}
              </div>
              {/* TODO(S3-01): watchlist star next to this button. */}
              <Button className="h-11 w-full text-[15px] font-semibold sm:w-auto" asChild>
                <Link to={`/chat?q=${encodeURIComponent(`Technical analysis ${symbol}`)}`}>Ask AI about this stock</Link>
              </Button>
            </header>

            <Suspense fallback={<div className="h-[420px] rounded-card border bg-card" aria-hidden="true" />}>
              <PriceChart key={symbol} symbol={symbol} />
            </Suspense>

            {/* TODO(S1-08): projection tab (fan chart) once the quantitative projection endpoint exists. */}
            <div className="space-y-4">
              <Tabs tab={tab} onChange={changeTab} />
              <div id="panel-Summary" role="tabpanel" aria-labelledby="tab-Summary" hidden={tab !== 'Summary'}>
                <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                  {quote.status === 'ready' && <StockCard stockPrice={quote.value} variant="detail" />}
                  {technicals.status === 'ready' && <TechnicalAnalysisCard technicalAnalysis={technicals.value} />}
                  {technicals.status === 'loading' && <p className="text-muted-foreground">Loading technical analysis…</p>}
                  {technicals.status === 'error' && <Failed what="Technical analysis" message={technicals.message} onRetry={retryTechnicals} />}
                </div>
              </div>
              <div id="panel-News" role="tabpanel" aria-labelledby="tab-News" hidden={tab !== 'News'}>
                {newsOpened && <NewsPanel symbol={symbol} />}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
