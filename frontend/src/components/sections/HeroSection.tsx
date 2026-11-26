import { AnswerPanel } from './AnswerPanel';

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[1248px] px-4 pb-16 pt-10 sm:px-6 md:pb-[72px] md:pt-14">
      <div className="mb-10 flex flex-wrap items-end gap-x-16 gap-y-6">
        <h1 id="hero-title" className="flex-[1_1_560px] font-display text-section font-bold leading-[0.95] md:text-hero lg:text-mega">
          Ask about any stock.
          <br />
          Check every number.
        </h1>
        <p className="max-w-[400px] flex-[1_1_320px] text-[18px] leading-[1.55] text-foreground/80">
          US and Indonesian stocks: prices, indicators and news in a chat. Each answer says where the data came from and how old it is.
        </p>
      </div>
      <AnswerPanel />
    </section>
  );
}
