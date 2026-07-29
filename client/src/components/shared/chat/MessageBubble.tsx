import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, AlertCircle, Sparkles, Zap } from 'lucide-react';
import type { Message } from './ChatWidget';

export interface MessageBubbleProps {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}

const followUpSuggestions = ['Show Critical Tasks', 'Due Today', 'View Department', 'Open Board', 'Dashboard Summary'];

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  // Format the time (fallback to now if id is not a timestamp)
  const timestamp = parseInt(message.id);
  const time = new Date(isNaN(timestamp) ? Date.now() : timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Source info
  const isInstant = message.metadata?.Model === 'TemplateEngine';

  if (isSystem) {
    return (
      <div className="flex gap-2 max-w-[90%] self-center px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs items-center my-2">
        <AlertCircle size={14} className="shrink-0" />
        <span className="font-medium">{message.content}</span>
      </div>
    );
  }

  // Pick 2 random suggestions (deterministic based on message id for stable render)
  const suggIndex = isNaN(timestamp) ? 0 : timestamp % followUpSuggestions.length;
  const sugg1 = followUpSuggestions[suggIndex];
  const sugg2 = followUpSuggestions[(suggIndex + 1) % followUpSuggestions.length];

  return (
    <div className={`flex gap-3 max-w-[90%] mb-2 ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto mb-1 ${
        isUser ? 'bg-purple-600 text-white shadow-sm' : 'bg-purple-600/20 text-purple-500 border border-purple-500/20 shadow-sm'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={18} />}
      </div>
      
      {/* Content Container */}
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
        
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-[14px] shadow-sm leading-relaxed overflow-hidden break-words w-full ${
          isUser 
            ? 'bg-purple-600 text-white rounded-br-sm' 
            : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-sm prose prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 max-w-none'
        }`}>
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({node, ...props}) => <ul className="space-y-2 my-3 border border-[var(--border)] bg-[var(--surface-1)] rounded-lg p-3 pl-8 shadow-sm" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-purple-500" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-purple-400" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-3 border border-[var(--border)] rounded-lg">
                    <table className="w-full text-sm text-left" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => <th className="px-4 py-2 bg-[var(--surface-1)] border-b border-[var(--border)] text-[var(--text-secondary)] font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-2 border-b border-[var(--border)] last:border-0" {...props} />,
                code: ({node, ...props}) => <code className="bg-[var(--surface-1)] text-pink-400 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Footer info (Timestamp & Source) */}
        <div className="flex items-center gap-2 px-1 mt-0.5">
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
            {time}
          </span>
          {!isUser && isInstant && (
            <span className="text-[10px] flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <Zap size={10} /> Instant Response
            </span>
          )}
          {!isUser && !isInstant && (
            <span className="text-[10px] flex items-center gap-1 text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
              <Sparkles size={10} /> AI Generated
            </span>
          )}
        </div>

        {/* Follow up suggestions */}
        {!isUser && onSuggestionClick && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            <button 
              onClick={() => onSuggestionClick(sugg1)}
              className="text-[11px] px-2.5 py-1 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/50 rounded-full text-[var(--text-secondary)] hover:text-purple-400 transition-colors focus:outline-none"
            >
              {sugg1}
            </button>
            <button 
              onClick={() => onSuggestionClick(sugg2)}
              className="text-[11px] px-2.5 py-1 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/50 rounded-full text-[var(--text-secondary)] hover:text-purple-400 transition-colors focus:outline-none"
            >
              {sugg2}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
