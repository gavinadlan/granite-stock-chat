import { MessageCircle } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 sm:mb-4">
      <div className="flex max-w-[85%] sm:max-w-[80%] flex-row items-start space-x-2 sm:space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center">
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        </div>

        {/* Typing Animation */}
        <div className="bg-card border border-border rounded-xl px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}