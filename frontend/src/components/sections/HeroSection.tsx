import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Disclaimer } from '@/components/Disclaimer';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { HeroDemo } from './HeroDemo';

export function HeroSection() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16">
      <div>
        <h1 className="text-display font-bold lg:text-hero">Ask about a stock and get an answer with its source.</h1>
        <p className="mt-6 max-w-[65ch] text-title text-muted-foreground">
          StockAI answers questions about US and Indonesian stocks with prices, indicators and news, and shows where each number came from and when.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Hidden, not removed, while auth loads so the layout does not jump. */}
          <Button size="lg" asChild className={cn('w-full sm:w-auto', isLoading && 'invisible')}>
            {isAuthenticated ? <Link to="/chat">Open chat</Link> : <Link to="/register">Create an account</Link>}
          </Button>
          <a
            href="#features"
            className="inline-flex min-h-11 items-center rounded-control font-medium underline underline-offset-4 hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            See what you can ask
          </a>
        </div>
        <Disclaimer short className="mt-6" />
      </div>
      <HeroDemo />
    </div>
  );
}
