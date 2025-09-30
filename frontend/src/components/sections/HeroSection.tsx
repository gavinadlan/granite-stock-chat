import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  return (
    <div id="hero" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              AI-Powered Stock Analysis
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900">
              Stock Market AI Assistant
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get real-time stock prices, AI-powered predictions, technical analysis, and market news. Make informed trading decisions with our advanced AI chatbot.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
