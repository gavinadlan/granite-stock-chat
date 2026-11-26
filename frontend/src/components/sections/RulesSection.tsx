const RULES = [
  {
    title: 'Fill a gap with a guess',
    body: 'If Yahoo Finance or NewsAPI does not answer, you get an error message. Never a made-up price or headline.',
  },
  {
    title: 'Let the AI invent numbers',
    body: 'RSI, MACD and moving averages are calculated in code from daily candles. IBM Granite only explains them, and never gives a price target.',
  },
  {
    title: 'Hide how old the data is',
    body: 'Every card shows its source, the time it was fetched and whether the quote is delayed.',
  },
];

/** Dark band in both themes: content uses the .dark tokens, the band itself the --band token. */
export function RulesSection() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="scroll-mt-4 bg-band">
      <div className="dark mx-auto max-w-[1248px] px-4 py-16 text-foreground sm:px-6 md:py-[88px]">
        <h2 id="rules-title" className="mb-12 max-w-[720px] font-display text-[36px] font-bold leading-[1.05] tracking-[-0.02em] md:text-section">
          Three things StockAI will not do.
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {RULES.map((r) => (
            <div key={r.title} className="border-t-2 border-primary pt-5">
              <h3 className="mb-2.5 text-[22px] font-semibold">{r.title}</h3>
              <p className="leading-[1.6] text-foreground/80">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
