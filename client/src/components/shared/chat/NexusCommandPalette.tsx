import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight } from 'lucide-react';
import { playPopSound } from '../../../utils/nexusEffects';

interface NexusCommandPaletteProps {
  onOpenChat: (query?: string) => void;
}

export function NexusCommandPalette({ onOpenChat }: NexusCommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) playPopSound();
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onOpenChat(query);
      setQuery("");
    }
  };

  const executeAction = (actionQuery: string) => {
    setIsOpen(false);
    onOpenChat(actionQuery);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl bg-[var(--surface-1)]/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="relative border-b border-[var(--border)]/50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask Nexus or search WorkTrail..."
                className="w-full bg-transparent pl-12 pr-16 py-4 text-[17px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-bold bg-[var(--surface-3)] px-2 py-1 rounded border border-[var(--border)] shadow-sm">
                <Command size={12} /> K
              </div>
            </form>
            
            <div className="p-2 bg-[var(--surface-1)]">
              <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                Quick Actions
              </div>
              <button 
                onClick={() => executeAction("Show my critical tasks")} 
                className="w-full flex items-center justify-between px-3 py-3 mt-1 hover:bg-purple-500/10 rounded-xl transition-colors text-left group focus:outline-none focus:bg-purple-500/10"
              >
                <span className="text-[14px] font-medium text-[var(--text-secondary)] group-hover:text-purple-400 transition-colors">Show my critical tasks</span>
                <ArrowRight size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
              <button 
                onClick={() => executeAction("View dashboard summary")} 
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-purple-500/10 rounded-xl transition-colors text-left group focus:outline-none focus:bg-purple-500/10"
              >
                <span className="text-[14px] font-medium text-[var(--text-secondary)] group-hover:text-purple-400 transition-colors">View dashboard summary</span>
                <ArrowRight size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
              <button 
                onClick={() => executeAction("List all departments")} 
                className="w-full flex items-center justify-between px-3 py-3 hover:bg-purple-500/10 rounded-xl transition-colors text-left group focus:outline-none focus:bg-purple-500/10"
              >
                <span className="text-[14px] font-medium text-[var(--text-secondary)] group-hover:text-purple-400 transition-colors">List all departments</span>
                <ArrowRight size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
