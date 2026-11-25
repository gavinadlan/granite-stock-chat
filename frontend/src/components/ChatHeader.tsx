import { Link } from 'react-router-dom';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { LogoMark } from '@/components/brand/LogoMark';
import { UserMenu } from './UserMenu';

interface ChatHeaderProps {
  title: string;
  stocksOpen: boolean;
  onOpenStocks: () => void;
}

export function ChatHeader({ title, stocksOpen, onOpenStocks }: ChatHeaderProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b px-3 sm:gap-5 sm:px-4">
      <Link to="/" className="flex flex-shrink-0 items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <LogoMark className="h-[25px] w-[25px] sm:hidden" />
        <Logo className="hidden sm:inline-flex" />
      </Link>
      <h1 className="min-w-0 flex-1 truncate font-sans font-medium">{title}</h1>
      <Button variant="ghost" className="h-11 px-3" aria-haspopup="dialog" aria-expanded={stocksOpen} onClick={onOpenStocks}>
        <List className="h-5 w-5 sm:mr-2" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Stocks</span>
      </Button>
      <UserMenu />
    </header>
  );
}
