import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import KpiCard from '../components/KpiCard';
import { Users, Activity, ListChecks, Target } from 'lucide-react';
import api from '../services/api';

const STATUS_STYLE = { Open: 'bg-rust-100 text-rust', 'In Progress': 'bg-gold/20 text-gold', Resolved: 'bg-growth-100 text-growth-600' };

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    api.get('/admin/analytics').then((r) => setAnalytics(r.data));
    api.get('/admin/users').then((r) => setUsers(r.data.items));
    api.get('/admin/feedback').then((r) => setFeedback(r.data.items));
  }, []);

  const toggleStatus = async (u) => {
    const status = u.status === 'active' ? 'disabled' : 'active';
    await api.put(`/admin/users/${u._id}/status`, { status });
    setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, status } : x)));
  };

  const updateFeedbackStatus = async (f, status) => {
    await api.put(`/admin/feedback/${f._id}`, { status });
    setFeedback((prev) => prev.map((x) => (x._id === f._id ? { ...x, status } : x)));
  };

  if (!analytics) return <AppLayout title="Admin"><p className="text-sm text-ink-300">Loading…</p></AppLayout>;

  return (
    <AppLayout title="Admin Dashboard">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Users" value={analytics.totalUsers} icon={Users} />
        <KpiCard label="Active Users" value={analytics.activeUsers} icon={Activity} />
        <KpiCard label="Habit Completion Rate" value={`${analytics.habitCompletionRate}`} icon={ListChecks} />
        <KpiCard label="Goal Completion Rate" value={`${analytics.goalCompletionRate}%`} icon={Target} />
      </div>

      <div className="flex gap-2 mb-4">
        {['users', 'feedback'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-150 ${tab === t ? 'gradient-brand text-white shadow-glow' : 'border border-ink/[0.12] text-ink-500 hover:bg-ink/[0.04] hover:border-ink/25'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-ink-300 border-b border-ink/[0.07]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-ink/[0.05] last:border-0 hover:bg-brand/[0.04] transition-colors duration-150">
                  <td className="px-4 py-3 text-ink-700">{u.name}</td>
                  <td className="px-4 py-3 text-ink-500">{u.email}</td>
                  <td className="px-4 py-3 text-ink-500 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-growth-100 text-growth-600' : 'bg-rust-100 text-rust'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleStatus(u)} className="text-xs text-brand underline hover:text-ink-700 transition-colors">
                      {u.status === 'active' ? 'Disable' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="card divide-y divide-ink/[0.06]">
          {feedback.length === 0 && <p className="text-sm text-ink-300 p-5">No feedback submitted yet.</p>}
          {feedback.map((f) => (
            <div key={f._id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-700">{f.subject}</p>
                  <p className="text-xs text-ink-300">{f.userId?.name} · {f.userId?.email} · {f.type}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span>
              </div>
              <p className="text-sm text-ink-500 mt-2">{f.message}</p>
              <div className="flex gap-2 mt-3">
                {['Open', 'In Progress', 'Resolved'].map((s) => (
                  <button key={s} onClick={() => updateFeedbackStatus(f, s)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors duration-150 ${f.status === s ? 'border-brand text-brand bg-brand/5' : 'border-ink/[0.12] text-ink-300 hover:border-ink/25 hover:text-ink-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
