import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div id="hero" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm dark:bg-slate-800 dark:text-slate-200">
              AI-Powered Stock Analysis
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
              Stock Market AI Assistant
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Get real-time stock prices, AI-powered predictions, technical analysis, and market news. Make informed trading decisions with our advanced AI chatbot.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoading ? (
              // Loading state - show skeleton buttons
              <>
                <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </>
            ) : isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/chat">
                  Start Chatting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onScrollToSection('features')}
            >
              Learn More
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
