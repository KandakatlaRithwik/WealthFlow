import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Logo from '../components/Logo';

export default function AppLayout({ title, children }) {
  return (
    <div className="min-h-screen flex bg-paper relative">
      <Sidebar />
      <div className="flex-1 min-w-0 relative bg-dot-grid">
        {/* Very faint watermark + soft brand glow, purely decorative */}
        <Logo size={420} id="wf-app-watermark" className="watermark fixed -bottom-24 -right-24 opacity-[0.025] pointer-events-none" />
        <div className="fixed top-0 right-0 h-80 w-80 rounded-full bg-brand/[0.05] blur-3xl pointer-events-none" />

        <Topbar title={title} />
        <main className="relative p-5 lg:p-8 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
