import { Header } from './sections/Header';
import { TickerStrip } from './sections/TickerStrip';
import { HeroSection } from './sections/HeroSection';
import { RulesSection } from './sections/RulesSection';
import { AskSection } from './sections/AskSection';
import { CtaSection } from './sections/CtaSection';
import { Footer } from './sections/Footer';

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <TickerStrip />
      <Header />
      <main>
        <HeroSection />
        <RulesSection />
        <AskSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
