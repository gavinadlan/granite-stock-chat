import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Marquee, MarqueeItem } from "@/components/ui/marquee"
import { ArrowRight, BarChart3, Brain, Newspaper, TrendingUp, Zap, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

// Import images
import ibmGraniteLogo from "./image/ibm-granite.png"
import awsLogo from "./image/aws.png"
import yahooFinanceLogo from "./image/yahoo-finance.png"
import alphaVantageLogo from "./image/alpha-vantage.png"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Stock AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link to="/chat" className="text-slate-600 hover:text-slate-900 transition-colors">
                Chat
              </Link>
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/chat">Start Chatting</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-slate-600" />
              ) : (
                <Menu className="h-6 w-6 text-slate-600" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/chat" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chat
                </Link>
                <Link 
                  to="/" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/" 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Button asChild className="mt-4">
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                    Start Chatting
                  </Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm">
              AI-Powered Stock Analysis
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900">
              Stock Market AI Assistant
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get real-time stock prices, AI-powered predictions, technical analysis, and market news. 
              Make informed trading decisions with our advanced AI chatbot.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Powerful Features</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need for successful stock market analysis and trading decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Real-time Prices */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Real-time Prices</CardTitle>
              <CardDescription>
                Get live stock prices and market data from multiple sources
              </CardDescription>
            </CardHeader>
          </Card>

          {/* AI Predictions */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">AI Predictions</CardTitle>
              <CardDescription>
                IBM Granite-powered predictions for future stock movements
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Technical Analysis */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Technical Analysis</CardTitle>
              <CardDescription>
                RSI, MACD, moving averages, and support/resistance levels
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Market News */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Newspaper className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Market News</CardTitle>
              <CardDescription>
                Latest news and sentiment analysis for informed decisions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How it Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Simple steps to get started with AI-powered stock analysis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold">Ask Questions</h3>
            <p className="text-slate-600">
              Type your questions about stocks, prices, or market analysis
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold">AI Processing</h3>
            <p className="text-slate-600">
              Our AI analyzes data and provides comprehensive insights
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold">Get Results</h3>
            <p className="text-slate-600">
              Receive detailed analysis, predictions, and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Marquee */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Powered by Leading Technologies</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with industry-leading AI, cloud, and data technologies
            </p>
          </div>
          
          {/* Marquee Container */}
          <Marquee pauseOnHover speed={30}>
            {/* First set of logos */}
            <MarqueeItem>
              {/* IBM Granite */}
              <div className="flex items-center space-x-3">
                <img 
                  src={ibmGraniteLogo} 
                  alt="IBM Granite" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">IBM Granite AI</span>
              </div>
              
              {/* AWS */}
              <div className="flex items-center space-x-3">
                <img 
                  src={awsLogo} 
                  alt="AWS" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">AWS Lambda</span>
              </div>
              
              {/* Yahoo Finance */}
              <div className="flex items-center space-x-3">
                <img 
                  src={yahooFinanceLogo} 
                  alt="Yahoo Finance" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">Yahoo Finance</span>
              </div>
              
              {/* Alpha Vantage */}
              <div className="flex items-center space-x-3">
                <img 
                  src={alphaVantageLogo} 
                  alt="Alpha Vantage" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">Alpha Vantage</span>
              </div>
            </MarqueeItem>
            
            {/* Duplicate set for seamless loop */}
            <MarqueeItem>
              {/* IBM Granite */}
              <div className="flex items-center space-x-3">
                <img 
                  src={ibmGraniteLogo} 
                  alt="IBM Granite" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">IBM Granite AI</span>
              </div>
              
              {/* AWS */}
              <div className="flex items-center space-x-3">
                <img 
                  src={awsLogo} 
                  alt="AWS" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">AWS Lambda</span>
              </div>
              
              {/* Yahoo Finance */}
              <div className="flex items-center space-x-3">
                <img 
                  src={yahooFinanceLogo} 
                  alt="Yahoo Finance" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">Yahoo Finance</span>
              </div>
              
              {/* Alpha Vantage */}
              <div className="flex items-center space-x-3">
                <img 
                  src={alphaVantageLogo} 
                  alt="Alpha Vantage" 
                  className="w-12 h-12 object-contain"
                />
                <span className="text-slate-700 font-semibold">Alpha Vantage</span>
              </div>
            </MarqueeItem>
          </Marquee>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Ready to Start Trading Smarter?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Join thousands of traders using AI to make better investment decisions
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/chat">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Free Analysis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Stock Market AI Assistant</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powered by IBM Granite AI, AWS Lambda, and real-time market data. 
              Make informed trading decisions with advanced AI analysis.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-slate-400">
              <span>© 2024 Stock Market AI</span>
              <span>•</span>
              <span>Powered by AI</span>
              <span>•</span>
              <span>Real-time Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}