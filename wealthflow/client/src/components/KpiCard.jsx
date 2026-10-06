import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TONE_STYLES = {
  brand: 'bg-brand/10 text-brand',
  growth: 'bg-growth-100 text-growth-600',
  rust: 'bg-rust-100 text-rust',
  gold: 'bg-gold/15 text-gold',
};

export default function KpiCard({ label, value, changePct, icon: Icon, invertColor = false, tone = 'brand' }) {
  const positive = invertColor ? changePct < 0 : changePct >= 0;
  return (
    <div className="card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-ink-300">{label}</span>
        {Icon && (
          <span className={`h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${TONE_STYLES[tone]}`}>
            <Icon size={16} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="text-2xl font-display italic text-ink-700">{value}</div>
      {changePct !== undefined && changePct !== null && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-growth' : 'text-rust'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(changePct)}% vs last month
        </div>
      )}
    </div>
  );
}
