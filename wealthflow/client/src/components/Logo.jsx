import React from 'react';

// WealthFlow mark: ascending bars crossed by a trend line — "flow" toward
// growth. Gradient reads from CSS vars so it follows the active theme.
export default function Logo({ size = 36, className = '', id = 'wf-logo' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="rgb(var(--c-brand))" />
          <stop offset="100%" stopColor="rgb(var(--c-brand-2))" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id})`} />
      <rect x="9" y="22" width="5" height="10" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="17.5" y="16" width="5" height="16" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="26" y="10" width="5" height="22" rx="1.5" fill="white" fillOpacity="0.95" />
      <path d="M8 21 L17 14 L25.5 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      <circle cx="25.5" cy="9" r="2.3" fill="white" />
    </svg>
  );
}
