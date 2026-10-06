import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-paper-100 rounded-2xl shadow-xl w-full max-w-md p-6 border border-ink/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink-700">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-ink/[0.05] focus-ring" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
