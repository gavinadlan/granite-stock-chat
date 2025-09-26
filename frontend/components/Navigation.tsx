import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Home, MessageSquare, ArrowLeft } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <Card className="p-4 m-4 mb-0 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Stock Market AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              {isChat ? 'Chat Interface' : 'Real-time prices, predictions & market analysis'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isChat ? (
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-gradient-primary flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Start Chat</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};