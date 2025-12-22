import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, TrendingUp, BarChart3, Newspaper, List, X } from 'lucide-react';
import StockAILogo from '@/components/image/logo.png';
import { stockMarketAPI, ChatMessage } from '@/services/stockMarketAPI';
import { MessageBubble } from './MessageBubble';
import { StockCard } from './StockCard';
import { PredictionChart } from './PredictionChart';
import { TechnicalAnalysisCard } from './TechnicalAnalysisCard';
import { NewsCard } from './NewsCard';
import { TypingIndicator } from './TypingIndicator';
import { StockSymbolTable } from './StockSymbolTable';
import { API_CONSTANTS } from '@/lib/constants';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI stock market assistant. I can help you with real-time stock prices, predictions, technical analysis, and market news. Try asking me about a stock like 'What's the price of AAPL?' or 'Predict TSLA stock'.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStockTable, setShowStockTable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await stockMarketAPI.processMessage(inputValue);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectSymbol = (symbol: string) => {
    setInputValue(`What's the price of ${symbol}?`);
    setShowStockTable(false);
    // Focus on input after selection
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  const renderMessageData = (message: ChatMessage) => {
    if (!message.data) return null;

    const { stockPrice, prediction, technicalAnalysis, news } = message.data;

    return (
      <div className="space-y-4 mt-4 px-2">
        {stockPrice && <StockCard stockPrice={stockPrice} />}
        {prediction && <PredictionChart prediction={prediction} />}
        {technicalAnalysis && <TechnicalAnalysisCard technicalAnalysis={technicalAnalysis} />}
        {news && news.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">Latest News</h4>
            <div className="grid gap-3">
              {news.slice(0, API_CONSTANTS.MAX_DISPLAY_NEWS).map((item, index) => (
                <NewsCard key={index} newsItem={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img src={StockAILogo} alt="Stock AI" className="h-6 w-6" />
            <span>Stock Market AI Assistant</span>
            <Badge variant="secondary" className="ml-auto">
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStockTable(!showStockTable)}
              className="ml-2"
            >
              {showStockTable ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Hide Stocks
                </>
              ) : (
                <>
                  <List className="h-4 w-4 mr-1" />
                  Browse Stocks
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stock Symbol Table */}
      {showStockTable && (
        <div className="mb-6">
          <StockSymbolTable onSelectSymbol={handleSelectSymbol} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
        {messages.map((message) => (
          <div key={message.id} className="w-full">
            <MessageBubble message={message} />
            {renderMessageData(message)}
          </div>
        ))}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stocks, predictions, technical analysis, or news..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("What's the price of AAPL?")}
              disabled={isLoading}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              AAPL Price
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Predict TSLA stock")}
              disabled={isLoading}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Predict TSLA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Technical analysis for MSFT")}
              disabled={isLoading}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Analyze MSFT
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("News about GOOGL")}
              disabled={isLoading}
            >
              <Newspaper className="h-3 w-3 mr-1" />
              GOOGL News
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}