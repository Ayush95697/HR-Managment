import { ClipboardList, LayoutDashboard, Building2, Layout, Search, BarChart3 } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-500/20">
        <span className="text-3xl">👋</span>
      </div>
      <h2 className="text-xl font-bold mb-2">Welcome back, {userName}</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-8">How can I help today?</p>
      
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {suggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] hover:border-purple-500/30 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Icon size={14} className="text-purple-500" />
              {suggestion.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
