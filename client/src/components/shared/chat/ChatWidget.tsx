import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';

import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { NexusCompanion } from './NexusCompanion';
import { NexusCommandPalette } from './NexusCommandPalette';
import type { Message } from './types';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { accessToken, user } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'User';

  const handleSend = async (text: string) => {
    if (!text.trim() || !accessToken) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat', { message: text }, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      });
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: response.data.answer, metadata: response.data.metadata
      }]);
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to connect.';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Error: ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommandPaletteSubmit = (text?: string) => {
    setIsOpen(true);
    if (text) setTimeout(() => handleSend(text), 100);
  };

  const panelShared: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '20px',
    background: '#0d0e18',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  };

  const Sidebar = () => (
    <div style={{
      width: '240px', flexShrink: 0, height: '100%',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.015)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
      padding: '20px 12px', gap: '24px',
    }}>
      {[
        { label: 'Quick Commands', items: ['Show my critical tasks', 'View dashboard summary', 'List all departments', 'My pending approvals'], clickable: true },
        { label: 'Recent', items: ['Q3 Sprint Planning', 'Engineering Department Stats'], clickable: false },
      ].map(section => (
        <div key={section.label}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
            {section.label}
          </div>
          {section.items.map(cmd => (
            <button key={cmd}
              onClick={section.clickable ? () => handleCommandPaletteSubmit(cmd) : undefined}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', borderRadius: '8px', cursor: section.clickable ? 'pointer' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (section.clickable) { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; } }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'none'; }}
            >{cmd}</button>
          ))}
        </div>
      ))}
    </div>
  );

  const ContextBar = () => (
    <div style={{ flexShrink: 0, padding: '5px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
        Role: {user?.role || 'Admin'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
        Workspace: HQ
      </span>
    </div>
  );

  return (
    <>
      <NexusCommandPalette onOpenChat={handleCommandPaletteSubmit} />
      <NexusCompanion isOpen={isOpen} onOpen={() => setIsOpen(true)} userName={userName} />

      {/* ---- NORMAL floating panel ---- */}
      <AnimatePresence>
        {isOpen && !isExpanded && (
          <motion.div
            key="chat-normal"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              ...panelShared,
              position: 'fixed',
              bottom: '7rem',
              right: '1.5rem',
              width: '400px',
              maxWidth: 'calc(100vw - 3rem)',
              height: 'min(660px, calc(100vh - 9rem))',
              zIndex: 60,
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <ChatHeader onClose={() => setIsOpen(false)} isExpanded={false} onToggleExpand={() => setIsExpanded(true)} />
              <ContextBar />
              <ChatMessageList messages={messages} isLoading={isLoading} userName={userName} onSuggestionClick={handleSend} />
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- EXPANDED modal — rendered via Portal to escape any transform ancestor ---- */}
      <AnimatePresence>
        {isOpen && isExpanded && createPortal(
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsExpanded(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            />

            {/* Expanded panel — centered purely via CSS, Framer only fades */}
            <motion.div
              key="chat-expanded"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                ...panelShared,
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(1100px, 92vw)',
                height: 'min(860px, 90vh)',
                zIndex: 9999,
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ display: 'flex', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden' }}>
                <Sidebar />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0, height: '100%' }}>
                  <ChatHeader onClose={() => setIsOpen(false)} isExpanded={true} onToggleExpand={() => setIsExpanded(false)} />
                  <ContextBar />
                  <ChatMessageList messages={messages} isLoading={isLoading} userName={userName} onSuggestionClick={handleSend} />
                  <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
              </div>
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}
