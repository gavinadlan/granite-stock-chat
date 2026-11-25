const STEPS = [
  { title: 'Type a question with a ticker.', text: 'Use capitals, for example AAPL or BBCA.JK.' },
  {
    title: 'StockAI gets the data.',
    text: 'The backend calls Yahoo Finance or NewsAPI. If you ask for an outlook, IBM Granite also describes general factors and risks, without a price target.',
  },
  { title: 'Read the answer.', text: 'Figures come with a source and a time. If a provider is down, you see an error instead of a number.' },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="how-title" className="text-display font-semibold">
          How it works
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map(({ title, text }, i) => (
            <li key={title}>
              <span aria-hidden="true" className="font-display text-heading font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <h3 className="mt-2 text-title font-semibold">{title}</h3>
              <p className="mt-2 max-w-[65ch] text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
