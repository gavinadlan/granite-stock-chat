import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const itemClass = 'block w-full rounded-control px-3 py-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Disclosure with plain links, so normal Tab navigation works; Escape or an outside click closes it. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <Button
        ref={button}
        variant="ghost"
        className="h-11 px-3"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <User className="h-5 w-5" aria-hidden="true" />
        <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-card border bg-popover p-1 text-popover-foreground">
          {user && (
            <div className="border-b px-3 py-2">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}
          <Link to="/profile" className={`${itemClass} mt-1`}>Profile</Link>
          <Link to="/settings" className={itemClass}>Settings</Link>
          <button type="button" className={itemClass} onClick={() => logout()}>Log out</button>
        </div>
      )}
    </div>
  );
}
