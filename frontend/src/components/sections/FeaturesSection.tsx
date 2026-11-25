import { cn } from '@/lib/utils';
import { NewsIllustration, PriceIllustration, TechnicalIllustration } from './FeatureIllustrations';

const FEATURES = [
  {
    title: 'Price',
    text: 'Price, daily change and volume for US and Indonesian tickers, from Yahoo Finance. Quotes may be delayed, and the card says so.',
    example: "What's the price of AAPL?",
    Illustration: PriceIllustration,
  },
  {
    title: 'Technical analysis',
    text: 'RSI (14), MACD (12, 26, 9), SMA 20/50/200, and the 20-session low and high as support and resistance. Code calculates them from daily prices; the language model does not.',
    example: 'Technical analysis BBCA.JK',
    Illustration: TechnicalIllustration,
  },
  {
    title: 'News',
    text: 'Recent articles that mention the ticker, from NewsAPI, with a link to each source. If there are none, the answer says so.',
    example: 'News about TSLA',
    Illustration: NewsIllustration,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="features-title" className="text-display font-semibold">
          What you can ask
        </h2>
        <div className="mt-12 space-y-16 md:space-y-24">
          {FEATURES.map(({ title, text, example, Illustration }, i) => (
            <div key={title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className={cn(i % 2 === 1 && 'lg:order-2')}>
                <h3 className="text-heading font-semibold">{title}</h3>
                <p className="mt-3 max-w-[65ch] text-muted-foreground">{text}</p>
                <p className="mt-5 w-fit rounded-panel bg-muted px-4 py-2.5">{example}</p>
              </div>
              <Illustration />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
