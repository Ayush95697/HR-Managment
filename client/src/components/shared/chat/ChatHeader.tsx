import { Bot, Expand, X, Minimize2 } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function ChatHeader({ onClose, isExpanded, onToggleExpand }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--surface-2)] shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2 bg-purple-600/20 text-purple-500 rounded-lg shadow-sm">
            <Bot size={22} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[var(--surface-2)] rounded-full animate-pulse shadow-sm"></div>
        </div>
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-1.5">
            🤖 WorkTrail Nexus
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium">
            <span className="text-emerald-500">Online</span> <span className="text-[var(--text-tertiary)] px-1">●</span> Ask about • Tasks • Employees • Depts • Boards
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-[var(--surface-3)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          title={isExpanded ? "Collapse chat" : "Expand chat"}
          aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Expand size={18} />}
        </button>
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
