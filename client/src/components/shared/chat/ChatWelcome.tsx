import { ClipboardList, LayoutDashboard, Building2, Layout, Search, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatWelcomeProps {
  userName: string;
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { text: 'My Tasks', icon: ClipboardList },
  { text: 'Dashboard Summary', icon: LayoutDashboard },
  { text: 'Departments', icon: Building2 },
  { text: 'Active Boards', icon: Layout },
  { text: 'Search Employee', icon: Search },
  { text: 'Board Status', icon: BarChart3 }
];

export function ChatWelcome({ userName, onSuggestionClick }: ChatWelcomeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full p-6 text-center"
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] border border-purple-500/20"
      >
        <span className="text-3xl">👋</span>
      </motion.div>
      <h2 className="text-2xl font-bold mb-2 tracking-tight">Welcome back, {userName}</h2>
      <p className="text-[var(--text-secondary)] text-[15px] mb-10">How can I help today?</p>
      
      <div className="flex flex-wrap justify-center gap-2.5 max-w-[420px]">
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)' }}
              key={idx}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--surface-2)]/80 backdrop-blur-sm hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/40 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            >
              <Icon size={16} className="text-purple-500" />
              {suggestion.text}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
