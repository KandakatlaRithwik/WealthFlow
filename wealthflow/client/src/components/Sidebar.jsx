import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, Wallet, ListChecks, FileBarChart, Settings, LifeBuoy, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/habits', label: 'Habits', icon: ListChecks },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/wealth', label: 'Wealth', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
];

const navClass = ({ isActive }) =>
  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 focus-ring ${
    isActive
      ? 'bg-brand/10 text-brand font-medium'
      : 'text-ink-500 hover:bg-ink/[0.04] hover:text-ink-700 hover:translate-x-0.5'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-ink/[0.07] bg-paper-100 h-screen sticky top-0">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Logo size={32} id="wf-sidebar" />
          <span className="font-display italic text-[17px] text-ink-700 tracking-tight">WealthFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navClass}>
            <Icon size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:scale-110" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={navClass}>
            <ShieldCheck size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:scale-110" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-ink/[0.07] pt-3">
        <NavLink to="/profile" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-500 hover:bg-ink/[0.04] hover:text-ink-700 hover:translate-x-0.5 transition-all duration-150 focus-ring">
          <Settings size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:rotate-45" /> Settings
        </NavLink>
        <NavLink to="/feedback" className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-500 hover:bg-ink/[0.04] hover:text-ink-700 hover:translate-x-0.5 transition-all duration-150 focus-ring">
          <LifeBuoy size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:scale-110" /> Help & Feedback
        </NavLink>
        <button onClick={logout} className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-500 hover:bg-rust-100 hover:text-rust transition-colors duration-150 focus-ring">
          <LogOut size={18} strokeWidth={1.75} className="transition-transform duration-150 group-hover:translate-x-0.5" /> Log out
        </button>
      </div>
    </aside>
  );
}
