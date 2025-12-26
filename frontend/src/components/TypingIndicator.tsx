import { MessageCircle } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 sm:mb-4">
      <div className="flex max-w-[85%] sm:max-w-[80%] flex-row items-start space-x-2 sm:space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-sm">
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>

        {/* Typing Animation */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}