import { Bot, X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ChatHeader({ onClose, isExpanded, onToggleExpand }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]/50 bg-[var(--surface-2)]/80 backdrop-blur-md shrink-0 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-500 rounded-xl shadow-inner border border-purple-500/10">
            <Bot size={24} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[var(--surface-2)] rounded-full animate-pulse shadow-sm"></div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-semibold text-[15px] flex items-center gap-1.5 tracking-tight text-[var(--text-primary)]">
            🤖 WorkTrail Nexus
          </h3>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 font-medium flex items-center gap-1.5 opacity-90">
            <span className="text-emerald-500 flex items-center gap-1">
              Online
            </span> 
            <span className="text-[var(--text-tertiary)] text-[8px]">●</span> 
            <span>Ask about Tasks, Employees, Boards</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">

        <button
          onClick={onClose}
          className="p-2 hover:bg-[var(--surface-3)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          title="Close chat (ESC)"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
