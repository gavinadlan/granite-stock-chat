import { Link } from 'react-router-dom';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockAILogo from '@/components/image/logo.png';
import { UserMenu } from './UserMenu';

interface ChatHeaderProps {
  title: string;
  stocksOpen: boolean;
  onOpenStocks: () => void;
}

export function ChatHeader({ title, stocksOpen, onOpenStocks }: ChatHeaderProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b px-3 sm:px-4">
      <Link to="/" className="flex-shrink-0 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="StockAI home">
        <img src={StockAILogo} alt="" className="h-8 w-8" />
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
