import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { Bot, User, AlertCircle, Sparkles, Zap } from 'lucide-react';
import type { Message } from './types';
import { motion } from 'framer-motion';

export interface MessageBubbleProps {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}

const SUGGESTIONS = ['Show Critical Tasks', 'Due Today', 'View Department', 'Open Board', 'Dashboard Summary'];

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const ts = parseInt(message.id);
  const time = new Date(isNaN(ts) ? Date.now() : ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isInstant = message.metadata?.Model === 'TemplateEngine';

  if (isSystem) {
    return (
      <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', background: 'var(--danger-light, rgba(239,68,68,0.08))', border: '1px solid var(--danger, rgba(239,68,68,0.2))', borderRadius: '12px', alignItems: 'center', color: 'var(--danger, #f87171)', fontSize: '12px' }}>
        <AlertCircle size={13} style={{ flexShrink: 0 }} />
        <span>{message.content}</span>
      </div>
    );
  }

  const idx = isNaN(ts) ? 0 : ts % SUGGESTIONS.length;
  const chips = [SUGGESTIONS[idx], SUGGESTIONS[(idx + 1) % SUGGESTIONS.length]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        flexDirection: isUser ? 'row-reverse' : 'row',
        /* User rows: indent from left so right-side avatar stays inside panel */
        paddingLeft: isUser ? '12%' : 0,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isUser
          ? { background: 'var(--accent, #7c3aed)', color: 'white' }
          : { background: 'var(--accent-light, rgba(124,58,237,0.15))', color: 'var(--accent, #a78bfa)', border: '1px solid var(--accent, rgba(124,58,237,0.3))' }),
      }}>
        {isUser ? <User size={13} strokeWidth={2.5} /> : <Bot size={13} strokeWidth={2} />}
      </div>

      {/* Message column — does NOT use flex:1, uses max-width instead */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        /* 100% minus avatar(28px) minus gap(8px) */
        maxWidth: 'calc(100% - 36px)',
        minWidth: 0,
      }}>
        {/* Bubble */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '18px',
          fontSize: '14px',
          lineHeight: '1.65',
          wordBreak: 'break-word',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          /* User bubble: only as wide as its content, not full-width */
          ...(isUser
            ? {
                background: 'var(--accent, #7c3aed)',
                color: 'white',
                borderBottomRightRadius: '5px',
                /* Constrain user bubble so avatar stays visible */
                maxWidth: '100%',
                display: 'inline-block',
              }
            : {
                background: 'var(--surface, #1d1e2c)',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                color: 'var(--text-primary, #d1d5e0)',
                borderBottomLeftRadius: '5px',
                /* Bot bubble can be wider */
                width: '100%',
              }),
        }}>
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ node, ...props }) => <p style={{ margin: '0 0 8px 0' }} {...props} />,
                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '18px', margin: '6px 0', listStyleType: 'disc' }} {...props} />,
                ol: ({ node, ...props }) => <ol style={{ paddingLeft: '18px', margin: '6px 0', listStyleType: 'decimal' }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginBottom: '3px' }} {...props} />,
                strong: ({ node, ...props }) => <strong style={{ fontWeight: 600, color: '#c4b5fd' }} {...props} />,
                table: ({ node, ...props }) => (
                  <div style={{ overflowX: 'auto', margin: '10px 0', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '10px', background: 'var(--surface-2, #13141f)' }}>
                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }} {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => <th style={{ padding: '8px 12px', background: 'var(--surface-hover, #1d1e2c)', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', color: 'var(--text-muted, rgba(255,255,255,0.4))', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }} {...props} />,
                td: ({ node, ...props }) => <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.05))', color: 'var(--text-primary, #d1d5e0)' }} {...props} />,
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', margin: '8px 0', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                      <div style={{ background: 'var(--surface-2, #282c34)', color: 'var(--text-muted, rgba(255,255,255,0.35))', padding: '3px 12px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                        {match?.[1] || 'code'}
                      </div>
                      <code className={className} {...props}>{children}</code>
                    </div>
                  ) : (
                    <code style={{ background: 'var(--surface-hover, rgba(255,255,255,0.08))', color: 'var(--accent, #f9a8d4)', padding: '1px 5px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted, rgba(255,255,255,0.22))' }}>{time}</span>
          {!isUser && isInstant && (
            <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--success, #34d399)', background: 'var(--success-light, rgba(52,211,153,0.1))', padding: '1px 8px', borderRadius: '100px', border: '1px solid var(--success-light, rgba(52,211,153,0.2))' }}>
              <Zap size={9} /> Instant
            </span>
          )}
          {!isUser && !isInstant && (
            <span style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent, #a78bfa)', background: 'var(--accent-light, rgba(124,58,237,0.1))', padding: '1px 8px', borderRadius: '100px', border: '1px solid var(--accent-light, rgba(124,58,237,0.2))' }}>
              <Sparkles size={9} /> AI Generated
            </span>
          )}
        </div>

        {/* Chips */}
        {!isUser && onSuggestionClick && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            {chips.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                onClick={() => onSuggestionClick(s)}
                style={{ fontSize: '11.5px', fontWeight: 500, padding: '5px 12px', background: 'var(--surface-hover, rgba(255,255,255,0.04))', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: '100px', color: 'var(--text-secondary, rgba(255,255,255,0.4))', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'var(--accent, #a78bfa)'; el.style.borderColor = 'var(--accent, rgba(124,58,237,0.4))'; el.style.background = 'var(--accent-light, rgba(124,58,237,0.08))'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'var(--text-secondary, rgba(255,255,255,0.4))'; el.style.borderColor = 'var(--border, rgba(255,255,255,0.1))'; el.style.background = 'var(--surface-hover, rgba(255,255,255,0.04))'; }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
