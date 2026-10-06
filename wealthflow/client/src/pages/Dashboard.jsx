import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Flame } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import KpiCard from '../components/KpiCard';
import ProgressBar from '../components/ProgressBar';
import { SkeletonCard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary } from '../services/dashboard.service';
import { formatCurrency, formatDate } from '../utils/format';

const CATEGORY_COLORS = ['#1F7A5C', '#C79A3D', '#B4532A', '#334155', '#7C9885', '#A78B5F', '#64748B', '#D9B08C', '#4E6E5D'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary().then(setData).finally(() => setLoading(false));
  }, []);

  const currency = user?.currency || 'INR';
  const donutData = data ? Object.entries(data.spendingBreakdown || {}).map(([name, value]) => ({ name, value })) : [];
  const hasAnyData = data && (data.totalIncome > 0 || data.totalExpenses > 0);
  const hasNetWorthHistory = data && data.netWorthHistory && data.netWorthHistory.length > 1;

  return (
    <AppLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-display italic text-ink-700">{greeting()}, {user?.name?.split(' ')[0]}</h2>
        <p className="text-sm text-ink-300 mt-1">Here's where your money and habits stand this month.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && data && !hasAnyData && (
        <EmptyState
          icon={Wallet}
          title="Start tracking your money"
          description="Add your first income or expense to see your financial dashboard come to life."
          actionLabel="+ Add Transaction"
          onAction={() => (window.location.href = '/transactions')}
        />
      )}

      {!loading && data && hasAnyData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Net Worth" value={formatCurrency(data.netWorth, currency)} changePct={data.netWorthChangePct ?? undefined} icon={Wallet} tone="brand" />
            <KpiCard label="Total Income" value={formatCurrency(data.totalIncome, currency)} changePct={data.incomeChangePct} icon={TrendingUp} tone="growth" />
            <KpiCard label="Total Expenses" value={formatCurrency(data.totalExpenses, currency)} changePct={data.expenseChangePct} icon={TrendingDown} invertColor tone="rust" />
            <KpiCard label="Total Savings" value={formatCurrency(data.totalSavings, currency)} changePct={data.savingsChangePct} icon={PiggyBank} tone="gold" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-ink-700 mb-4">Income vs Expenses — last 6 months</h3>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.cashFlowTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F172A0F" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #0F172A15', fontSize: 12 }} />
                  <Bar dataKey="income" fill="#1F7A5C" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#B4532A" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-medium text-ink-700 mb-4">Expense Breakdown</h3>
              {donutData.length === 0 ? (
                <p className="text-sm text-ink-300 py-10 text-center">No expenses recorded this month yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {donutData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #0F172A15', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-5">
              <h3 className="text-sm font-medium text-ink-700 mb-1">Net Worth Trend</h3>
              <p className="text-xs text-ink-300 mb-3">Frozen month-end snapshots</p>
              {hasNetWorthHistory ? (
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={data.netWorthHistory}>
                    <defs>
                      <linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1F7A5C" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#1F7A5C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" hide />
                    <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #0F172A15', fontSize: 12 }} />
                    <Area type="monotone" dataKey="netWorth" stroke="#1F7A5C" fill="url(#nwg)" strokeWidth={2} name="Net Worth" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-300 py-8 text-center">Net worth history builds up as months close — check back after your first full month.</p>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-ink-700">Financial Habit Score</h3>
                <span className="text-xs text-ink-300">app-generated</span>
              </div>
              <div className="text-3xl font-semibold num text-growth mt-2">{data.financialHabitScore.total}<span className="text-base text-ink-300">/100</span></div>
              <div className="mt-4 space-y-2">
                {Object.entries(data.financialHabitScore.breakdown).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs text-ink-500">
                    <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="num">{v}/{data.financialHabitScore.maxima[k]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-medium text-ink-700 mb-3">Active Habits</h3>
              {(!data.activeHabits || data.activeHabits.length === 0) ? (
                <p className="text-sm text-ink-300">No active habits yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.activeHabits.slice(0, 3).map((h) => (
                    <div key={h._id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-ink-700 truncate">{h.title}</p>
                        <p className="text-xs text-ink-300">{h.completionRate}% completion</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gold shrink-0 ml-2">
                        <Flame size={13} /> {h.currentStreak}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="card p-5">
              <h3 className="text-sm font-medium text-ink-700 mb-4">Savings Goals</h3>
              {(!data.activeGoals || data.activeGoals.length === 0) ? (
                <EmptyState title="No goals yet" description="Create a savings goal to start tracking progress." />
              ) : (
                <div className="space-y-4">
                  {data.activeGoals.map((g) => (
                    <div key={g._id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-ink-700">{g.name}</span>
                        <span className="num text-ink-500">{formatCurrency(g.currentAmount, currency)} / {formatCurrency(g.targetAmount, currency)}</span>
                      </div>
                      <ProgressBar percentage={g.percentage} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-medium text-ink-700 mb-4">Recent Transactions</h3>
              {(!data.recentTransactions || data.recentTransactions.length === 0) ? (
                <p className="text-sm text-ink-300">No transactions yet.</p>
              ) : (
                <div className="divide-y divide-ink/[0.06]">
                  {data.recentTransactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="text-ink-700 truncate">{t.description || t.category}</p>
                        <p className="text-xs text-ink-300">{t.category} · {formatDate(t.date)}</p>
                      </div>
                      <span className={`num font-medium shrink-0 ml-2 ${t.type === 'income' ? 'text-growth' : 'text-rust'}`}>
                        {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-medium text-ink-700 mb-3">Monthly Financial Health Summary</h3>
            {(!data.insights || data.insights.length === 0) ? (
              <p className="text-sm text-ink-300">Insights will appear here once you have a bit more activity logged.</p>
            ) : (
              <ul className="space-y-2">
                {data.insights.map((ins, i) => (
                  <li key={i} className={`text-sm flex items-start gap-2 ${ins.tone === 'warning' ? 'text-rust' : ins.tone === 'positive' ? 'text-growth-600' : 'text-ink-500'}`}>
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
                    {ins.text}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-ink-300/80 mt-4">These are automated observations from your own data, not financial advice.</p>
          </div>
        </>
      )}
    </AppLayout>
  );
}
