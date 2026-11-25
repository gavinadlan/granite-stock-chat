import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const linkClass =
  'inline-flex min-h-11 items-center rounded-control px-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-h-11 items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <nav aria-label="Sections" className="ml-8 hidden gap-6 md:flex">
          <a href="#features" className={linkClass}>What you can ask</a>
          <a href="#how-it-works" className={linkClass}>How it works</a>
        </nav>
        <div className={cn('ml-auto flex items-center gap-1 sm:gap-2', isLoading && 'invisible')}>
          {isAuthenticated ? (
            <>
              <Button className="h-11" asChild>
                <Link to="/chat">Open chat</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" className="h-11" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button className="h-11" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
