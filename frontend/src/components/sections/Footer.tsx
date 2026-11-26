export function Footer() {
  return (
    <footer className="border-t border-input/40">
      <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-8 gap-y-3 px-4 py-7 text-sm text-muted-foreground sm:px-6">
        <span className="font-display text-[20px] font-bold text-foreground">StockAI</span>
        <p>Data: Yahoo Finance, NewsAPI. AI: IBM Granite. Quotes may be delayed.</p>
        <p className="basis-full">
          Not financial advice. <span lang="id">Bukan nasihat keuangan.</span>
        </p>
      </div>
    </footer>
  );
}
