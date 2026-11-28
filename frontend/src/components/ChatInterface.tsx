import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stockMarketAPI, ChatMessage } from '@/services/stockMarketAPI';
import { startsTimeGroup } from '@/lib/time';
import { Sheet } from '@/components/ui/sheet';
import { ChatComposer } from './ChatComposer';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatHeader } from './ChatHeader';
import { DataSourceBadge } from './DataSourceBadge';
import { MessageBubble } from './MessageBubble';
import { MessageSkeleton } from './MessageSkeleton';
import { NewsCard } from './NewsCard';
import { PredictionCard } from './PredictionCard';
import { StockCard } from './StockCard';
import { StockSymbolTable } from './StockSymbolTable';
import { TechnicalAnalysisCard } from './TechnicalAnalysisCard';

function MessageData({ data }: { data: NonNullable<ChatMessage['data']> }) {
  const { stockPrice, prediction, technicalAnalysis, news, newsMeta } = data;
  return (
    <div className="mt-3 space-y-3">
      {stockPrice && <StockCard stockPrice={stockPrice} />}
      {prediction && <PredictionCard prediction={prediction} />}
      {technicalAnalysis && <TechnicalAnalysisCard technicalAnalysis={technicalAnalysis} />}
      {news && news.length > 0 && (
        <>
          {news.map((item) => (
            <NewsCard key={item.id} newsItem={item} />
          ))}
          {newsMeta && <DataSourceBadge source={newsMeta.source} asOf={newsMeta.asOf} stale={newsMeta.stale} />}
        </>
      )}
    </div>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchParams] = useSearchParams();
  // Landing page links prefill the composer with ?q=; the user still presses send.
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [stocksOpen, setStocksOpen] = useState(false);
  const scroller = useRef<HTMLElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (override?: string) => {
    const text = (override ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), content: text, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    if (override === undefined) setInputValue('');
    setIsLoading(true);
    composer.current?.focus();

    try {
      const response = await stockMarketAPI.processMessage(text);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        error: { message: 'Unexpected error.', retryText: text },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSymbol = (symbol: string) => {
    setInputValue(`What's the price of ${symbol}?`);
    setStocksOpen(false);
    // Closing the dialog returns focus to the "Stocks" button; move it on afterwards.
    requestAnimationFrame(() => composer.current?.focus());
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ChatHeader title={messages[0]?.content ?? 'New chat'} stocksOpen={stocksOpen} onOpenStocks={() => setStocksOpen(true)} />

      <main ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-[760px] flex-col px-4">
          {messages.length === 0 && <ChatEmptyState onSelect={(text) => handleSendMessage(text)} />}

          <div role="log" aria-live="polite" aria-label="Conversation" className={messages.length ? 'flex-1 space-y-6 py-6' : ''}>
            {messages.map((message, i) => (
              <div key={message.id} className="space-y-6">
                {startsTimeGroup(messages[i - 1]?.timestamp, message.timestamp) && (
                  <time dateTime={message.timestamp.toISOString()} className="block text-center text-sm text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                )}
                <div>
                  <MessageBubble message={message} onRetry={(text) => handleSendMessage(text)} />
                  {message.data && <MessageData data={message.data} />}
                </div>
              </div>
            ))}
            {isLoading && <MessageSkeleton />}
          </div>

          <ChatComposer ref={composer} value={inputValue} onChange={setInputValue} onSend={() => handleSendMessage()} busy={isLoading} />
        </div>
      </main>

      <Sheet open={stocksOpen} onOpenChange={setStocksOpen} title="Stocks">
        <StockSymbolTable onSelectSymbol={handleSelectSymbol} />
      </Sheet>
    </div>
  );
}
