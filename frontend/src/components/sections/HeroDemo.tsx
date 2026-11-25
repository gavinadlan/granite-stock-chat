import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageSkeleton } from '@/components/MessageSkeleton';
import { StockCard } from '@/components/StockCard';
import { stockMarketAPI, StockPrice } from '@/services/stockMarketAPI';

const SYMBOL = 'BBCA.JK';

type State = { status: 'loading' } | { status: 'ready'; price: StockPrice } | { status: 'failed' };

/**
 * One real question and answer from our backend. When the quote cannot be loaded it says so;
 * it never falls back to example figures.
 * TODO(S1-02): /stock-price must stay public for this demo once JWT auth is added.
 * TODO(S1-04): this quote must go through the server-side cache.
 */
export function HeroDemo() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [timestamp] = useState(() => new Date());

  useEffect(() => {
    let stale = false;
    setState({ status: 'loading' });
    stockMarketAPI
      .getStockPrice(SYMBOL)
      .then((price) => !stale && setState({ status: 'ready', price }))
      .catch(() => !stale && setState({ status: 'failed' }));
    return () => {
      stale = true;
    };
  }, [attempt]);

  return (
    <section aria-labelledby="live-example" className="w-full max-w-xl space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
      <h2 id="live-example" className="sr-only">
        Live example
      </h2>
      <MessageBubble message={{ id: 'question', content: `How is ${SYMBOL} doing today?`, isUser: true, timestamp }} />
      <div aria-live="polite">
        {state.status === 'loading' && <MessageSkeleton />}
        {state.status === 'ready' && (
          <div className="space-y-3">
            <MessageBubble message={{ id: 'answer', content: `Here's the latest price we have for ${state.price.symbol}:`, isUser: false, timestamp }} />
            <StockCard stockPrice={state.price} />
            <p className="text-sm text-muted-foreground">Live answer, loaded when you opened this page.</p>
          </div>
        )}
        {state.status === 'failed' && (
          <div className="rounded-card border bg-card p-4 sm:p-5">
            <p className="font-medium">Live data unavailable right now.</p>
            <p className="mt-1 text-muted-foreground">No price is shown without a source.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setAttempt((n) => n + 1)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
