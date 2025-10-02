import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import StockAILogo from '@/components/image/image.png';

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo dengan transform scale yang lebih besar */}
              <Link 
                to="/" 
                className="flex items-center origin-left"
                style={{ 
                  transform: 'scale(3)',
                  marginLeft: '2rem',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              >
                <img 
                  src={StockAILogo} 
                  alt="Stock AI" 
                  className="h-12 w-12 object-contain"
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}