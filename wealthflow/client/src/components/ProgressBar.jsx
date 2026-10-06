import React from 'react';
export default function ProgressBar({ percentage, colorClass = 'bg-growth' }) {
  const pct = Math.min(Math.max(percentage, 0), 100);
  return (
    <div className="w-full h-2 rounded-full bg-ink/[0.06] overflow-hidden">
      <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}
