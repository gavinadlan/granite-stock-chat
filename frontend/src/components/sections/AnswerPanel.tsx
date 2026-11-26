import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/MessageBubble';
import { StockCard } from '@/components/StockCard';
import { TechnicalAnalysisCard } from '@/components/TechnicalAnalysisCard';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/apiClient';
import { stockMarketAPI, StockPrice, TechnicalAnalysis } from '@/services/stockMarketAPI';
import { indicatorSource, isAccountQuestion, parseTicker } from '@/lib/landing';
import { summarizeTechnicals } from '@/lib/summarizeTechnicals';
import { formatWibDateTime, formatWibTime, latestIso } from '@/lib/time';

const FIRST = { symbol: 'BBCA.JK', question: 'Technical analysis BBCA.JK' };
const FIRST_STATUS = 'Live answer, loaded when you opened this page';

type State =
  | { status: 'loading' }
  | { status: 'ready'; quote: StockPrice | null; ta: TechnicalAnalysis | null }
  | { status: 'failed'; symbol: string; reason: string | null }
  | { status: 'invalid' }
  | { status: 'account' };

function SkeletonAnswer() {
  return (
    <div className="space-y-5 motion-safe:animate-pulse" aria-hidden="true">
      <div className="h-4 w-full max-w-[640px] rounded-sm bg-muted" />
      <div className="flex flex-wrap gap-4">
        <div className="h-[236px] flex-[1_1_300px] rounded-card border" />
        <div className="h-[236px] flex-[2_1_460px] rounded-card border max-sm:basis-full" />
      </div>
    </div>
  );
}

function Unavailable({ what }: { what: string }) {
  return (
    <div className="flex flex-[1_1_300px] items-center rounded-card border p-5 text-muted-foreground">{what} unavailable right now.</div>
  );
}

function SourceLine({ quote, ta }: { quote: StockPrice | null; ta: TechnicalAnalysis | null }) {
  const latest = latestIso([quote?.asOf, ta?.asOf]);
  const when = latest && formatWibDateTime(latest);
  const source = ta ? `${indicatorSource(ta.source, ta.candlesUsed)}, calculated by StockAI` : quote?.source;
  return (
    <p className="text-[13px] text-muted-foreground">
      Source: {source}.{' '}
      {latest && when && (
        <>
          <time dateTime={latest}>{when}</time>.{' '}
        </>
      )}
      Not financial advice.
    </p>
  );
}

/** Hero answer panel: one real answer from our backend; visitors can ask for any ticker without an account. */
export function AnswerPanel() {
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(FIRST.question);
  const [state, setState] = useState<State>({ status: 'loading' });
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(FIRST_STATUS);
  const [turn, setTurn] = useState(0);
  const request = useRef(0);

  const load = useCallback(async (symbol: string, asked = false) => {
    const id = ++request.current;
    setState({ status: 'loading' });
    setTurn((t) => t + 1);
    const [quote, ta] = await Promise.allSettled([
      stockMarketAPI.getStockPrice(symbol),
      stockMarketAPI.getTechnicalAnalysis(symbol),
    ]);
    if (id !== request.current) return;
    if (quote.status === 'rejected' && ta.status === 'rejected') {
      const err = quote.reason;
      setState({ status: 'failed', symbol, reason: err instanceof ApiError ? err.message : null });
      return;
    }
    const q = quote.status === 'fulfilled' ? quote.value : null;
    const t = ta.status === 'fulfilled' ? ta.value : null;
    setState({ status: 'ready', quote: q, ta: t });
    if (asked) setStatus(`Live answer for ${q?.symbol ?? t?.symbol ?? symbol}, loaded at ${formatWibTime(new Date().toISOString())}`);
  }, []);

  // A second run (StrictMode) supersedes the first through the request counter.
  useEffect(() => {
    void load(FIRST.symbol);
  }, [load]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setQuestion(text);
    setInput('');
    if (isAccountQuestion(text)) {
      request.current++;
      setTurn((t) => t + 1);
      return setState({ status: 'account' });
    }
    const symbol = parseTicker(text);
    if (!symbol) {
      request.current++;
      setTurn((t) => t + 1);
      return setState({ status: 'invalid' });
    }
    void load(symbol, true);
  };

  const summary = state.status === 'ready' ? summarizeTechnicals(state.quote, state.ta) : null;

  return (
    <div>
      <h2 className="sr-only">Live example</h2>
      <div className="overflow-hidden rounded-panel border bg-card text-card-foreground">
        <p className="flex items-center gap-2 border-b px-4 py-3 text-[13px] text-muted-foreground sm:px-5">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
          {status}
        </p>

        <div aria-live="polite" aria-busy={state.status === 'loading'} className="flex flex-col gap-5 px-4 pb-2 pt-6 sm:px-7 sm:pt-7">
          <MessageBubble message={{ id: 'q', content: question, isUser: true, timestamp: new Date(0) }} />
          <div key={turn} className="space-y-5 motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in">
            {state.status === 'loading' && (
              <>
                <span className="sr-only">Fetching data…</span>
                <SkeletonAnswer />
              </>
            )}

            {state.status === 'ready' && (
              <>
                {summary && <p className="max-w-[640px] leading-[1.55]">{summary}</p>}
                <div className="flex flex-wrap gap-4">
                  {state.quote ? (
                    <StockCard stockPrice={state.quote} variant="compact" className="flex-[1_1_300px]" />
                  ) : (
                    <Unavailable what="Price" />
                  )}
                  {state.ta ? (
                    <TechnicalAnalysisCard technicalAnalysis={state.ta} variant="compact" className="flex-[2_1_460px] max-sm:basis-full" />
                  ) : (
                    <Unavailable what="Indicators" />
                  )}
                </div>
                <SourceLine quote={state.quote} ta={state.ta} />
              </>
            )}

            {state.status === 'failed' && (
              <div className="rounded-card border p-5">
                <p className="font-medium">Live data unavailable right now.</p>
                <p className="mt-1 text-muted-foreground">
                  {state.reason ? `${state.reason} ` : ''}No price is shown without a source.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void load(state.symbol, status !== FIRST_STATUS)}>
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
              </div>
            )}

            {state.status === 'invalid' && (
              <p className="rounded-card border p-5">
                That does not look like a ticker. Type one such as AAPL, TLKM.JK or NVDA.
              </p>
            )}

            {state.status === 'account' && (
              <div className="rounded-card border p-5">
                <p>News and AI explanations need a free account. Prices and indicators work here without one.</p>
                <Button size="sm" className="mt-4 font-semibold" asChild>
                  {isAuthenticated ? (
                    <Link to={`/chat?q=${encodeURIComponent(question)}`}>Ask in chat</Link>
                  ) : (
                    <Link to="/register">Sign up</Link>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-4 mb-4 mt-5 flex items-center gap-2 rounded-[12px] border-[1.5px] border-foreground py-1.5 pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card sm:mx-7 sm:mb-7"
        >
          <label htmlFor="try-ticker" className="sr-only">
            Ask about a stock
          </label>
          <input
            id="try-ticker"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try a ticker: AAPL, TLKM.JK, NVDA"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" className="h-11 rounded-[8px] px-5 text-[15px] font-semibold">
            Ask
          </Button>
        </form>
      </div>
      <p className="mt-3.5 text-sm text-muted-foreground">
        Prices and indicators work without an account. Sign up for news and AI explanations.
      </p>
    </div>
  );
}
