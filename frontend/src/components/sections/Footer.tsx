import { Link } from "react-router-dom"
import { Brain, Zap, TrendingUp, BarChart3, Newspaper, ExternalLink } from "lucide-react"
import { Logo } from "@/components/brand/Logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo className="text-[20px]" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered stock market assistant providing market data (may be delayed), technical analysis and AI explanations for educational purposes. Not investment advice.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>Powered by IBM Granite AI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/chat" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Start Chatting</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Sign Up</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Features</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Stock Prices</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span>AI Predictions</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>Technical Analysis</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                <span>Market News</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Powered By</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• IBM Granite AI</li>
              <li>• AWS Lambda</li>
              <li>• Yahoo Finance</li>
              <li>• Alpha Vantage</li>
              <li>• React & TypeScript</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground text-center md:text-left">
              <p>© {currentYear} StockAI. All rights reserved.</p>
              <p className="mt-1 max-w-xl">
                StockAI provides information for research and education only. It is not financial advice.
                Market data may be delayed. Bukan nasihat keuangan.
              </p>
              <p className="mt-1 text-xs">Built with ❤️ for the stock market community</p>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Sourced Data</span>
              </span>
              <span className="hidden md:inline">•</span>
              <span>Free to Use</span>
              <span className="hidden md:inline">•</span>
              <span>Serverless Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
