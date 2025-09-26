import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Newspaper, 
  Target, 
  Zap, 
  Shield,
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: DollarSign,
    title: "Real-Time Stock Prices",
    description: "Get instant access to current stock prices for any publicly traded company with live market data.",
    color: "text-financial-primary"
  },
  {
    icon: Target,
    title: "AI-Powered Predictions",
    description: "Advanced machine learning models predict future stock movements with confidence levels and timeframes.",
    color: "text-financial-success"
  },
  {
    icon: BarChart3,
    title: "Technical Analysis",
    description: "Comprehensive technical analysis including moving averages, trends, and chart patterns for informed decisions.",
    color: "text-financial-warning"
  },
  {
    icon: Newspaper,
    title: "Market News & Insights",
    description: "Stay updated with the latest market news, earnings reports, and financial insights from trusted sources.",
    color: "text-primary"
  }
];

const capabilities = [
  "Real-time stock price tracking",
  "Future price predictions with AI",
  "Technical analysis & chart patterns",
  "Latest financial news & market updates",
  "Interactive chat experience",
  "Support for major stock symbols"
];

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Card className="p-6 m-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stock Market AI Assistant</h1>
              <p className="text-muted-foreground">Powered by AWS Lambda & IBM Granite</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Live AI
          </Badge>
        </div>
      </Card>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Your Personal
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Stock Market Assistant
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get real-time stock prices, AI-powered predictions, and comprehensive market analysis 
              through an intelligent conversational interface.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-primary shadow-financial text-lg px-8 py-6"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-foreground mb-2">Powerful Features</h3>
            <p className="text-muted-foreground">Everything you need for informed investment decisions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-financial transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-chart group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Capabilities Section */}
        <Card className="p-8 shadow-financial bg-gradient-chart">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">What Can I Help You With?</h3>
                <p className="text-muted-foreground">
                  Our AI assistant is equipped with advanced capabilities to handle all your stock market queries:
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-foreground">{capability}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="bg-gradient-primary shadow-financial"
                onClick={() => navigate('/chat')}
              >
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-card shadow-card">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Bot className="h-4 w-4" />
                  <span>Example Query</span>
                </div>
                <p className="text-foreground">"What's Apple's current stock price and can you predict where it'll be next week?"</p>
              </Card>
              
              <Card className="p-4 bg-card shadow-card">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>AI Response</span>
                </div>
                <p className="text-foreground">Real-time price data + AI prediction with confidence levels</p>
              </Card>
            </div>
          </div>
        </Card>

        {/* Technology Section */}
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Powered by Advanced Technology</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              AWS Lambda
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              IBM Granite AI
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              Real-time APIs
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Serverless Architecture
            </Badge>
          </div>
        </div>

        {/* CTA Footer */}
        <Card className="p-8 text-center shadow-financial bg-gradient-primary">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Ready to Start Trading Smarter?</h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              Join thousands of investors using AI-powered insights to make better investment decisions.
            </p>
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 shadow-lg text-lg px-8 py-6"
              onClick={() => navigate('/chat')}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Your First Chat
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};