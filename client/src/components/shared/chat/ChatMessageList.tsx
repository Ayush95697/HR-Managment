import { useRef, useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { ChatWelcome } from './ChatWelcome';

const typingPhrases = [
  "Nexus is analyzing your workspace...",
  "Reviewing your active tasks...",
  "Checking department metrics...",
  "Analyzing current workload...",
  "Retrieving intelligent insights...",
  "Looking through your dashboard..."
];

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  userName: string;
  onSuggestionClick: (text: string) => void;
}

export function ChatMessageList({ messages, isLoading, userName, onSuggestionClick }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingPhraseIndex, setTypingPhraseIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setTypingPhraseIndex(prev => (prev + 1) % typingPhrases.length);
      }, 2500);
    } else {
      setTypingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (messages.length === 0) {
    return <ChatWelcome userName={userName} onSuggestionClick={onSuggestionClick} />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 px-4 py-5 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onSuggestionClick={onSuggestionClick} />
      ))}

      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex items-end gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#2a2b3d] text-purple-400 border border-purple-500/30">
            <Bot size={14} strokeWidth={2} />
          </div>
          <div className="px-4 py-3 bg-[#1d1e2c] border border-white/10 rounded-2xl rounded-bl-sm min-w-[180px]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-[13px] text-white/40">{typingPhrases[typingPhraseIndex]}</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} className="h-px" />
    </div>
  );
}
