const EXAMPLES = [
  { text: "What's the price of AAPL?", lang: 'en' },
  { text: 'Technical analysis BBCA.JK', lang: 'en' },
  { text: 'News about TSLA', lang: 'en' },
  { text: 'Harga TLKM.JK hari ini', lang: 'id' },
] as const;

export function ChatEmptyState({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <h2 className="text-heading font-semibold">What do you want to check?</h2>
      <p className="mt-2 text-muted-foreground">Prices, technical analysis and news for US and Indonesian stocks. Every answer shows its source and time.</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {EXAMPLES.map(({ text, lang }) => (
          <li key={text}>
            <button
              type="button"
              lang={lang}
              onClick={() => onSelect(text)}
              className="min-h-11 rounded-control border border-input bg-card px-4 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
