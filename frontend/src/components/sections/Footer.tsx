import { Link } from "react-router-dom"
import { Brain, Zap, TrendingUp, BarChart3, Newspaper, ExternalLink } from "lucide-react"
import StockAILogo from "@/components/image/logo.png"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={StockAILogo} 
                alt="Stock AI" 
                className="h-8 w-8 object-contain"
              />
              <h3 className="text-xl font-bold">StockAI</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered stock market assistant providing real-time data, predictions, and technical analysis to help you make informed trading decisions.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Powered by IBM Granite AI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/chat" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Start Chatting</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Sign Up</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Features</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span>Real-time Stock Prices</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Brain className="h-4 w-4 text-purple-400" />
                <span>AI Predictions</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <BarChart3 className="h-4 w-4 text-green-400" />
                <span>Technical Analysis</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400 text-sm">
                <Newspaper className="h-4 w-4 text-orange-400" />
                <span>Market News</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Powered By</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• IBM Granite AI</li>
              <li>• AWS Lambda</li>
              <li>• Yahoo Finance</li>
              <li>• Alpha Vantage</li>
              <li>• React & TypeScript</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-slate-400 text-center md:text-left">
              <p>© {currentYear} StockAI. All rights reserved.</p>
              <p className="mt-1 text-xs">Built with ❤️ for the stock market community</p>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Real-time Data</span>
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
