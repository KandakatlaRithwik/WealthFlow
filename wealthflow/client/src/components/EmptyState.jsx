import React from 'react';

export default function EmptyState({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && <Icon size={28} strokeWidth={1.5} className="text-ink-300 mb-3" />}
      <h3 className="text-ink-700 font-medium">{title}</h3>
      <p className="text-sm text-ink-300 mt-1 max-w-xs">{description}</p>
      {actionLabel && (
        <button onClick={onAction} className="mt-4 px-4 py-2 rounded-lg bg-ink-700 text-paper-100 text-sm font-medium hover:bg-ink focus-ring">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
