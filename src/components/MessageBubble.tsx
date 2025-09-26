import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
  data?: any;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
        <div className={`p-2 rounded-full ${isBot ? 'bg-primary' : 'bg-muted'}`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-foreground" />
          )}
        </div>
        <Card className={`p-3 ${isBot ? 'bg-card' : 'bg-primary text-primary-foreground'} shadow-card`}>
          <p className="text-sm whitespace-pre-line">{message.content}</p>
          <span className={`text-xs mt-2 block ${isBot ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
            {message.timestamp.toLocaleTimeString()}
          </span>
        </Card>
      </div>
    </div>
  );
};