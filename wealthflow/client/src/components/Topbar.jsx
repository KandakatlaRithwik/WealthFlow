import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const initials = (user?.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('');

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/[0.07] bg-paper/90 backdrop-blur px-5 lg:px-8 py-4">
      <h1 className="text-lg font-display italic text-ink-700 tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-ink/[0.05] focus-ring" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} className="text-ink-500" /> : <Moon size={18} strokeWidth={1.75} className="text-ink-500" />}
        </button>
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-ink-700 text-paper-100 text-xs font-medium flex items-center justify-center">
            {initials || 'U'}
          </div>
          <span className="text-sm text-ink-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
