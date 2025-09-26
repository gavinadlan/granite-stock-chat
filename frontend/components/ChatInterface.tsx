import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, TrendingUp, BarChart3, DollarSign, AlertCircle } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { StockCard } from './StockCard';
import { YahooStockCard } from './YahooStockCard';
import { PredictionChart } from './PredictionChart';
import { NewsCard } from './NewsCard';
import { TechnicalAnalysisCard } from './TechnicalAnalysisCard';
import { TypingIndicator } from './TypingIndicator';
import { stockMarketAPI, StockPrice, StockPrediction, NewsItem, TechnicalAnalysis } from '@/services/stockMarketAPI';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  data?: any;
  error?: string;
}

// Helper function to extract stock symbol from user input
const extractStockSymbol = (input: string): string | null => {
  const symbolPattern = /\b[A-Z]{1,5}\b/g;
  const matches = input.match(symbolPattern);
  
  if (matches) {
    return matches[0];
  }
  
  // Check for company names
  const companyMap: Record<string, string> = {
    'apple': 'AAPL',
    'tesla': 'TSLA',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'facebook': 'META',
    'netflix': 'NFLX',
    'nvidia': 'NVDA',
    'amd': 'AMD',
    'intel': 'INTC',
    'ibm': 'IBM',
    'oracle': 'ORCL',
    'salesforce': 'CRM',
    'adobe': 'ADBE'
  };
  
  const lowerInput = input.toLowerCase();
  for (const [company, symbol] of Object.entries(companyMap)) {
    if (lowerInput.includes(company)) {
      return symbol;
    }
  }
  
  return null;
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI stock market assistant. I can help you with real-time stock prices, predictions, technical analysis, and the latest market news. Try asking me about any stock symbol!",
      type: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        type: 'bot',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (input: string): Promise<Message> => {
    const lowerInput = input.toLowerCase();
    const symbol = extractStockSymbol(input);
    
    try {
      // Stock price request
      if (symbol && (lowerInput.includes('price') || lowerInput.includes('stock') || lowerInput.includes('current'))) {
        const stockData = await stockMarketAPI.getStockPrice(symbol);
        return {
          id: Date.now().toString(),
          content: `Here's the current price for ${symbol}:`,
          type: 'bot',
          timestamp: new Date(),
          data: { type: 'stock', symbol, data: stockData }
        };
      }

      // Stock prediction request
      if (symbol && (lowerInput.includes('predict') || lowerInput.includes('forecast') || lowerInput.includes('future'))) {
        const timeframe = lowerInput.includes('week') ? '1 week' : 
                         lowerInput.includes('month') ? '1 month' : 
                         lowerInput.includes('year') ? '1 year' : '1 week';
        
        const predictionData = await stockMarketAPI.getStockPrediction(symbol, timeframe);
        return {
          id: Date.now().toString(),
          content: `Here's the AI prediction for ${symbol} (${timeframe}):`,
          type: 'bot',
          timestamp: new Date(),
          data: { type: 'prediction', symbol, data: predictionData }
        };
      }

      // Technical analysis request
      if (symbol && (lowerInput.includes('analysis') || lowerInput.includes('technical') || lowerInput.includes('chart'))) {
        const analysisData = await stockMarketAPI.getTechnicalAnalysis(symbol);
        return {
          id: Date.now().toString(),
          content: `Here's the technical analysis for ${symbol}:`,
          type: 'bot',
          timestamp: new Date(),
          data: { type: 'analysis', symbol, data: analysisData }
        };
      }

      // News request
      if (lowerInput.includes('news') || lowerInput.includes('latest')) {
        const query = symbol ? `${symbol} stock` : 'stock market';
        const newsData = await stockMarketAPI.getMarketNews(query);
        return {
          id: Date.now().toString(),
          content: `Here are the latest market news${symbol ? ` for ${symbol}` : ''}:`,
          type: 'bot',
          timestamp: new Date(),
          data: { type: 'news', data: newsData }
        };
      }

      // General help response
      return {
        id: Date.now().toString(),
        content: `I can help you with stock prices, predictions, technical analysis, and market news. Try asking:
        • "What's Apple's stock price?" 
        • "Predict Tesla stock for next week"
        • "Technical analysis for Microsoft"
        • "Latest market news"
        • "Show me Amazon's current price"`,
        type: 'bot',
        timestamp: new Date(),
      };
    } catch (error) {
      throw error;
    }
  };

  const renderMessageData = (data: any) => {
    if (!data) return null;

    switch (data.type) {
      case 'stock':
        return <StockCard {...data.data} />;
      
      case 'prediction':
        return <PredictionChart {...data.data} />;
      
      case 'news':
        return (
          <div className="space-y-3">
            {data.data.map((news: NewsItem, index: number) => (
              <NewsCard key={index} {...news} />
            ))}
          </div>
        );
      
      case 'analysis':
        return <TechnicalAnalysisCard analysis={data.data} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Quick Actions */}
      <Card className="p-4 m-4 mb-0 shadow-card">
        <div className="flex space-x-2 overflow-x-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setInputValue("What's Apple stock price?")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <DollarSign className="h-4 w-4" />
            <span>Stock Price</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInputValue("Predict Tesla stock next week")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Prediction</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInputValue("Latest market news")}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Market News</span>
          </Button>
        </div>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.error && (
              <Card className="p-3 m-3 bg-red-50 border-red-200">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{message.error}</span>
                </div>
              </Card>
            )}
            {renderMessageData(message.data)}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="p-4 m-4 mt-0 shadow-card">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about stock prices, predictions, or market news..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} className="bg-gradient-primary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};