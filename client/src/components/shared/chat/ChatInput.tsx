import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

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

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isLoading]);

  const canSend = input.trim() && !isLoading;

  return (
    <div style={{ padding: '12px 16px 20px 16px', flexShrink: 0 }}>
      {/* Input pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--surface-hover, rgba(255,255,255,0.05))',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          borderRadius: '16px',
          padding: '8px 8px 8px 8px',
        }}
      >
        {/* Attach icon */}
        <button
          disabled
          title="Attach file (Coming soon)"
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--text-muted, rgba(255,255,255,0.25))',
            border: 'none',
            background: 'none',
            cursor: 'not-allowed',
            borderRadius: '10px',
          }}
        >
          <Paperclip size={16} strokeWidth={2} />
        </button>

        {/* Textarea */}
        <TextareaAutosize
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nexus anything..."
          disabled={isLoading}
          minRows={1}
          maxRows={6}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'white',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            padding: '4px 0',
          }}
          className="placeholder-white/25"
        />

        {/* Mic icon */}
        <button
          disabled
          title="Voice (Coming soon)"
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'var(--text-muted, rgba(255,255,255,0.25))',
            border: 'none',
            background: 'none',
            cursor: 'not-allowed',
            borderRadius: '10px',
          }}
        >
          <Mic size={16} strokeWidth={2} />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: canSend ? 'var(--accent, #7c3aed)' : 'var(--surface-hover, rgba(255,255,255,0.06))',
            color: canSend ? 'white' : 'var(--text-muted, rgba(255,255,255,0.2))',
            border: 'none',
            borderRadius: '10px',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          <Send size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted, rgba(255,255,255,0.2))', marginTop: '10px' }}>
        AI can make mistakes. Consider verifying critical information.
      </div>
    </div>
  );
}
