import { useUIStore } from '../../store/uiStore';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();
  const isLight = theme === 'light';

  return (
    <button 
      className={`theme-toggle ${isLight ? 'is-light' : 'is-dark'}`} 
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      type="button"
    >
      <Moon size={16} className="theme-toggle-icon moon-icon" />
      <div className="theme-toggle-track">
        <div className="theme-toggle-knob" />
      </div>
      <Sun size={16} className="theme-toggle-icon sun-icon" />
    </button>
  );
}
