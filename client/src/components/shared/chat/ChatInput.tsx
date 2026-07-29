import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] shrink-0">
      <div className="relative flex items-end gap-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-2 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-colors shadow-sm">
        
        <div className="flex gap-1 pb-1 pl-1 shrink-0">
          <button 
            disabled 
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-xl transition-colors opacity-50 cursor-not-allowed"
            title="Attach file (Coming soon)"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about tasks, employees, departments or boards..."
          disabled={isLoading}
          rows={1}
          className="flex-1 max-h-[150px] min-h-[24px] py-2 px-2 bg-transparent text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-[var(--border)] leading-tight"
        />

        <div className="flex gap-1 pb-1 pr-1 shrink-0">
          <button 
            disabled 
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-xl transition-colors opacity-50 cursor-not-allowed"
            title="Voice input (Coming soon)"
          >
            <Mic size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
