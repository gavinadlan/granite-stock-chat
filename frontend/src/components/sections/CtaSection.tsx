import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function CtaSection() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-[1248px] px-4 pb-16 sm:px-6 md:pb-[72px]">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-panel bg-primary p-8 text-primary-foreground md:p-12">
        <h2 id="cta-title" className="max-w-[620px] font-display text-[32px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[40px]">
          Start with the ticker you hold.
        </h2>
        {/* `dark` scope: ink button with paper text in both themes. */}
        <Link
          to={isAuthenticated ? '/chat' : '/register'}
          className={cn(
            'dark inline-flex min-h-12 items-center rounded-[8px] bg-background px-[22px] font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground',
            isLoading && 'invisible',
          )}
        >
          {isAuthenticated ? 'Open chat' : 'Create a free account'}
        </Link>
      </div>
    </section>
  );
}
