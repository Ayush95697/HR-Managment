import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';

import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { accessToken, user } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'User';

  const handleSend = async (text: string) => {
    if (!text.trim() || !accessToken) return;
    
    // Add user message to UI
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        '/api/chat',
        { message: text },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: response.data.answer,
        metadata: response.data.metadata
      }]);
    } catch (error: any) {
      const errorText = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to connect to the server.';
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: `Error: ${errorText}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
        aria-label="Open AI Assistant"
      >
        <Bot size={26} />
      </button>

      {/* Chat Popover / Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setIsExpanded(false)}
              />
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isExpanded ? {
                opacity: 1,
                scale: 1,
                width: 'min(900px, 90vw)',
                height: 'min(800px, 90vh)',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                right: 'auto',
                bottom: 'auto'
              } : {
                opacity: 1,
                scale: 1,
                width: '420px',
                height: '700px',
                right: '1.5rem',
                bottom: '1.5rem',
                top: 'auto',
                left: 'auto',
                x: '0%',
                y: '0%'
              }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed flex flex-col bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl max-w-[100vw] max-h-[100vh]`}
              style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
            >
              <ChatHeader 
                onClose={() => setIsOpen(false)} 
                isExpanded={isExpanded} 
                onToggleExpand={() => setIsExpanded(!isExpanded)} 
              />
              
              <ChatMessageList 
                messages={messages} 
                isLoading={isLoading} 
                userName={userName}
                onSuggestionClick={handleSend}
              />
              
              <ChatInput 
                onSend={handleSend} 
                isLoading={isLoading} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
