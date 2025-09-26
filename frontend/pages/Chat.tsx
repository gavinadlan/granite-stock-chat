import { ChatInterface } from '@/components/ChatInterface';
import { Navigation } from '@/components/Navigation';

const Chat = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chat;