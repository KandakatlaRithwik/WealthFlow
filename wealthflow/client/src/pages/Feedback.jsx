import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { submitFeedback, fetchMyFeedback } from '../services/feedback.service';
import { formatDate } from '../utils/format';

const TYPES = [
  { value: 'feedback', label: 'General feedback' },
  { value: 'bug', label: 'Bug report' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'feature_request', label: 'Feature request' },
];

const STATUS_STYLE = { Open: 'bg-rust-100 text-rust', 'In Progress': 'bg-gold/20 text-gold', Resolved: 'bg-growth-100 text-growth-600' };

export default function Feedback() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: 'feedback', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const load = () => fetchMyFeedback().then((d) => setItems(d.items));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await submitFeedback(form);
    setForm({ type: 'feedback', subject: '', message: '' });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    load();
  };

  return (
    <AppLayout title="Feedback & Support">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={submit} className="card p-5 space-y-3 h-fit">
          <h3 className="text-sm font-medium text-ink-700 mb-1">Send us feedback</h3>
          {sent && <div className="text-sm bg-growth-100 text-growth-600 px-3 py-2 rounded-lg">Thanks — we've received it.</div>}
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="input-field">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input-field" />
          <textarea required rows={4} placeholder="Tell us what's going on…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Submit</button>
        </form>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-ink-700 mb-3">Your submissions</h3>
          {items.length === 0 && <p className="text-sm text-ink-300">Nothing submitted yet.</p>}
          <div className="space-y-3">
            {items.map((f) => (
              <div key={f._id} className="border-b border-ink/[0.06] last:border-0 pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-700">{f.subject}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLE[f.status]}`}>{f.status}</span>
                </div>
                <p className="text-xs text-ink-300 mt-1">{f.message}</p>
                {f.adminResponse && <p className="text-xs text-growth-600 mt-1">Response: {f.adminResponse}</p>}
                <p className="text-[11px] text-ink-300/70 mt-1">{formatDate(f.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
