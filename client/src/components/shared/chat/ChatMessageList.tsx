import { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from './ChatWidget';
import { MessageBubble } from './MessageBubble';
import { ChatWelcome } from './ChatWelcome';

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  userName: string;
  onSuggestionClick: (text: string) => void;
}

export function ChatMessageList({ messages, isLoading, userName, onSuggestionClick }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <ChatWelcome userName={userName} onSuggestionClick={onSuggestionClick} />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col scrollbar-thin scrollbar-thumb-[var(--border)]">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onSuggestionClick={onSuggestionClick} />
      ))}
      
      {/* Typing Indicator Skeleton */}
      {isLoading && (
        <div className="flex gap-3 max-w-[85%] self-start mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto bg-purple-600/20 text-purple-500 shadow-sm border border-purple-500/20">
            <Bot size={18} />
          </div>
          <div className="flex flex-col gap-2 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl rounded-bl-sm min-w-[200px] shadow-sm">
             <div className="flex gap-2 mb-1 items-center text-xs text-[var(--text-secondary)] font-medium">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
               WorkTrail AI is thinking...
             </div>
             <div className="h-2 bg-[var(--surface-3)] rounded-full animate-pulse w-3/4 mt-1"></div>
             <div className="h-2 bg-[var(--surface-3)] rounded-full animate-pulse w-full"></div>
             <div className="h-2 bg-[var(--surface-3)] rounded-full animate-pulse w-5/6"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
