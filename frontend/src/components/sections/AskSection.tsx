import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ROWS = [
  { q: "What's the price of AAPL?", get: 'Price, daily change and volume', from: 'Yahoo Finance' },
  {
    q: 'Technical analysis BBCA.JK',
    get: 'RSI (14), MACD (12, 26, 9), SMA 20/50/200 and the 20-day range',
    from: 'Calculated from Yahoo Finance daily candles',
  },
  { q: 'News about TSLA', get: 'Recent articles with a link to each source, or a clear "none found"', from: 'NewsAPI' },
  { q: 'Outlook for MSFT', get: 'A plain-language read of the data and its risks, without a price target', from: 'IBM Granite, using the numbers above' },
];

export function AskSection() {
  const { isAuthenticated } = useAuth();
  const href = (q: string) => (isAuthenticated ? `/chat?q=${encodeURIComponent(q)}` : '/register');

  return (
    <section id="ask" aria-labelledby="ask-title" className="mx-auto max-w-[1248px] scroll-mt-4 px-4 py-16 sm:px-6 md:py-[88px]">
      <h2 id="ask-title" className="mb-8 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.02em] md:text-section">
        What you can ask
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th scope="col" className="pb-3 pr-4 font-medium">Type this</th>
              <th scope="col" className="px-4 pb-3 font-medium">You get</th>
              <th scope="col" className="pb-3 pl-4 font-medium">From</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.q} className="border-y border-input/40">
                <td className="py-5 pr-4">
                  <Link
                    to={href(r.q)}
                    className="inline-block whitespace-nowrap rounded-[8px] border border-input/40 bg-card px-3 py-2 hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {r.q}
                  </Link>
                </td>
                <td className="px-4 py-5">{r.get}</td>
                <td className="py-5 pl-4 text-muted-foreground">{r.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
