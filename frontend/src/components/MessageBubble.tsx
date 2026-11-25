import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/services/stockMarketAPI';

interface MessageBubbleProps {
  message: ChatMessage;
  /** Called with the original user text when the user clicks "Try again". */
  onRetry?: (text: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const { content, error, isUser } = message;

  if (isUser) {
    return (
      <p className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-panel bg-muted px-4 py-2.5 [overflow-wrap:anywhere]">
        <span className="sr-only">You: </span>
        {content}
      </p>
    );
  }

  return (
    <div>
      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
        <span className="sr-only">StockAI: </span>
        {content}
      </p>
      {error && onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={() => onRetry(error.retryText)}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
