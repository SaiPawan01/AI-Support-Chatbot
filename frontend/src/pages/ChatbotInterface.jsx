import { useContext, useEffect } from 'react';

import SidebarWindow from '../components/ChatbotPage/SidebarWindow';
import BotHeader from '../components/ChatbotPage/BotHeader';
import BotInput from '../components/ChatbotPage/BotInput';
import MessageArea from '../components/ChatbotPage/MessageArea';
import { ChatbotContext } from '../context/ChatbotContext';

export default function ChatbotInterface() {
  const { messages, messagesEndRef  } = useContext(ChatbotContext)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-slate-900">
      <SidebarWindow />
      <div className="flex-1 flex flex-col">
        <BotHeader />
        <MessageArea />
        <BotInput />
      </div>
    </div>
  );
}