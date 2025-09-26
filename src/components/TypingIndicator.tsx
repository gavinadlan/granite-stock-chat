import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-2 max-w-[80%]">
        <div className="p-2 rounded-full bg-primary">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <Card className="p-3 bg-card shadow-card">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </Card>
      </div>
    </div>
  );
};