import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { StockCard } from './StockCard';
import { PredictionChart } from './PredictionChart';
import { NewsCard } from './NewsCard';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  data?: any;
}

const SAMPLE_RESPONSES = {
  price: {
    AAPL: { symbol: 'AAPL', price: 189.75, change: 2.34, changePercent: 1.25 },
    TSLA: { symbol: 'TSLA', price: 248.50, change: -3.12, changePercent: -1.24 },
    MSFT: { symbol: 'MSFT', price: 378.85, change: 5.67, changePercent: 1.52 },
    GOOGL: { symbol: 'GOOGL', price: 142.56, change: 1.89, changePercent: 1.34 },
  },
  predictions: {
    AAPL: { current: 189.75, predicted: 205.30, confidence: 78, timeframe: '1 week' },
    TSLA: { current: 248.50, predicted: 235.20, confidence: 65, timeframe: '1 week' },
  },
  news: [
    { title: "Apple Reports Strong Q4 Earnings", source: "Bloomberg", time: "2h ago" },
    { title: "Tesla Announces New Factory in Mexico", source: "Reuters", time: "4h ago" },
    { title: "Microsoft Azure Revenue Surges 30%", source: "CNBC", time: "6h ago" },
  ]
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

    // Simulate API delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase();
    
    // Check for stock symbols
    const symbols = Object.keys(SAMPLE_RESPONSES.price);
    const foundSymbol = symbols.find(symbol => 
      lowerInput.includes(symbol.toLowerCase()) || 
      lowerInput.includes(['apple', 'tesla', 'microsoft', 'google'][symbols.indexOf(symbol)])
    );

    if (foundSymbol && lowerInput.includes('predict')) {
      return {
        id: Date.now().toString(),
        content: `Here's the AI prediction for ${foundSymbol}:`,
        type: 'bot',
        timestamp: new Date(),
        data: { type: 'prediction', symbol: foundSymbol }
      };
    }

    if (foundSymbol && (lowerInput.includes('price') || lowerInput.includes('stock'))) {
      return {
        id: Date.now().toString(),
        content: `Here's the current price for ${foundSymbol}:`,
        type: 'bot',
        timestamp: new Date(),
        data: { type: 'stock', symbol: foundSymbol }
      };
    }

    if (lowerInput.includes('news')) {
      return {
        id: Date.now().toString(),
        content: "Here are the latest market news:",
        type: 'bot',
        timestamp: new Date(),
        data: { type: 'news' }
      };
    }

    if (lowerInput.includes('analysis') || lowerInput.includes('technical')) {
      return {
        id: Date.now().toString(),
        content: `I can provide technical analysis for any stock. Try asking about a specific company like "Technical analysis for Apple" or use symbols like AAPL, TSLA, MSFT, GOOGL.`,
        type: 'bot',
        timestamp: new Date(),
      };
    }

    return {
      id: Date.now().toString(),
      content: `I can help you with stock prices, predictions, and market news. Try asking:
      • "What's Apple's stock price?" 
      • "Predict Tesla stock for next week"
      • "Latest market news"
      • "Technical analysis for Microsoft"`,
      type: 'bot',
      timestamp: new Date(),
    };
  };

  const renderMessageData = (data: any) => {
    if (!data) return null;

    switch (data.type) {
      case 'stock':
        const stockData = SAMPLE_RESPONSES.price[data.symbol as keyof typeof SAMPLE_RESPONSES.price];
        return <StockCard {...stockData} />;
      
      case 'prediction':
        const predictionData = SAMPLE_RESPONSES.predictions[data.symbol as keyof typeof SAMPLE_RESPONSES.predictions];
        return <PredictionChart {...predictionData} />;
      
      case 'news':
        return (
          <div className="space-y-3">
            {SAMPLE_RESPONSES.news.map((news, index) => (
              <NewsCard key={index} {...news} />
            ))}
          </div>
        );
      
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