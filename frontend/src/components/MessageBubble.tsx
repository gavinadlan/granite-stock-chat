import { User, MessageCircle, RotateCcw } from 'lucide-react';
import { ChatMessage } from '@/services/stockMarketAPI';

interface MessageBubbleProps {
  message: ChatMessage;
  /** Called with the original user text when the user clicks "Try again". */
  onRetry?: (text: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div className={`flex max-w-[85%] sm:max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-start ${message.isUser ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          message.isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        }`}>
          {message.isUser ? (
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-xl px-3 py-2 sm:px-4 sm:py-3 ${
          message.isUser 
            ? 'bg-muted text-foreground' 
            : 'bg-card border border-border text-foreground '
        }`}>
          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
          {message.error && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message.error!.retryText)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4 hover:decoration-2"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Try again
            </button>
          )}
          <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
            'text-muted-foreground'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}