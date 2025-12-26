import { User, MessageCircle } from 'lucide-react';
import { ChatMessage } from '@/services/stockMarketAPI';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div className={`flex max-w-[85%] sm:max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-start ${message.isUser ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm ${
          message.isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-slate-500 to-slate-600'
        }`}>
          {message.isUser ? (
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          ) : (
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
          message.isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : 'bg-white border border-slate-200 text-slate-900'
        }`}>
          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
          <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
            message.isUser ? 'text-blue-100' : 'text-slate-500'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}