import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const focus = 'rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const navLink = cn('inline-flex min-h-11 items-center px-1 text-[15px] text-muted-foreground hover:text-foreground', focus);

/** `sectionLinks`: the #ask/#rules anchors only exist on the landing page. */
export function Header({ sectionLinks = true }: { sectionLinks?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="mx-auto flex h-16 w-full max-w-[1248px] items-center gap-8 px-4 sm:px-6">
      <Link to="/" className={cn('flex min-h-11 items-center', focus)}>
        <Logo />
      </Link>
      {sectionLinks && (
        <nav aria-label="Sections" className="hidden flex-1 gap-6 md:flex">
          <a href="#ask" className={navLink}>What you can ask</a>
          <a href="#rules" className={navLink}>How we handle data</a>
        </nav>
      )}
      <div className={cn('ml-auto flex items-center gap-2 sm:gap-4', isLoading && 'invisible')}>
        {isAuthenticated ? (
          <>
            <Button className="h-11 text-[15px] font-semibold" asChild>
              <Link to="/chat">Open chat</Link>
            </Button>
            <UserMenu />
          </>
        ) : (
          <>
            <Link to="/login" className={cn('inline-flex min-h-11 items-center px-2 text-[15px] font-medium', focus)}>
              Sign in
            </Link>
            <Button className="h-11 text-[15px] font-semibold" asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
