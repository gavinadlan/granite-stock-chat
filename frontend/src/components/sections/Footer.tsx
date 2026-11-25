import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { Disclaimer } from '@/components/Disclaimer';

const linkClass = 'inline-flex min-h-11 items-center rounded-control underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
          <Logo className="text-[20px]" />
          <nav aria-label="Footer" className="flex gap-6">
            <Link to="/chat" className={linkClass}>Chat</Link>
            <Link to="/login" className={linkClass}>Sign in</Link>
            <Link to="/register" className={linkClass}>Sign up</Link>
          </nav>
        </div>
        <div className="max-w-[65ch] space-y-2 text-sm text-muted-foreground">
          <p>Data: Yahoo Finance, NewsAPI · AI: IBM Granite. Market data may be delayed.</p>
          <Disclaimer />
          <p>© {new Date().getFullYear()} StockAI</p>
        </div>
      </div>
    </footer>
  );
}
