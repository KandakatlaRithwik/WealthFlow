import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AppLayout from '../layouts/AppLayout';
import { fetchDashboardSummary } from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import api from '../services/api';

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { fetchDashboardSummary().then(setData); }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = data.recentTransactions.map((t) => [t.date, t.type, t.category, t.amount, t.description || '']);
    const csv = ['Date,Type,Category,Amount,Description', ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wealthflow-report.csv'; a.click();
  };

  const downloadPdf = async () => {
    const res = await api.get('/reports/pdf', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url; a.download = 'wealthflow-report.pdf'; a.click();
  };

  if (!data) return <AppLayout title="Reports"><p className="text-sm text-ink-300">Loading…</p></AppLayout>;

  return (
    <AppLayout title="Reports">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-300">Monthly financial report — current period.</p>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn-lift px-4 py-2 rounded-xl border border-ink/[0.12] text-sm font-medium text-ink-700 hover:bg-ink/[0.04] focus-ring">Export CSV</button>
          <button onClick={downloadPdf} className="px-4 py-2 rounded-lg bg-ink-700 text-paper-100 text-sm font-medium hover:bg-ink focus-ring">Download PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          ['Total Income', data.totalIncome], ['Total Expenses', data.totalExpenses],
          ['Total Savings', data.totalSavings], ['Net Worth', data.netWorth],
        ].map(([label, val]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ink-300">{label}</p>
            <p className="text-lg font-semibold num text-ink-700 mt-1">{formatCurrency(val, user?.currency)}</p>
          </div>
        ))}
      </div>
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-medium text-ink-700 mb-4">Savings Trend — last 6 months</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.cashFlowTrend}>
            <defs>
              <linearGradient id="repsg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F7A5C" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1F7A5C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0F172A0F" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 10, border: '1px solid #0F172A15', fontSize: 12 }} />
            <Area type="monotone" dataKey="savings" stroke="#1F7A5C" fill="url(#repsg)" strokeWidth={2} name="Savings" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-medium text-ink-700 mb-3">Top expense categories this month</h3>
        {Object.entries(data.spendingBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
          <div key={cat} className="flex justify-between text-sm py-1.5 border-b border-ink/[0.05] last:border-0">
            <span className="text-ink-500">{cat}</span>
            <span className="num text-ink-700">{formatCurrency(amt, user?.currency)}</span>
          </div>
        ))}
        {Object.keys(data.spendingBreakdown).length === 0 && <p className="text-sm text-ink-300">No expenses recorded this month.</p>}
      </div>
    </AppLayout>
  );
}
