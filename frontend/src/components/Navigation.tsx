import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StockAILogo from '@/components/image/image.png';

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Logo dengan transform scale yang lebih besar */}
              <Link 
                to="/" 
                className="flex items-center origin-left scale-[2.5] ml-4 mt-1 mb-1 sm:scale-[3] sm:ml-8 sm:mt-2 sm:mb-2"
              >
                <img 
                  src={StockAILogo} 
                  alt="Stock AI" 
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                />
              </Link>
            </div>
            
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" asChild>
                <Link to="/">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}