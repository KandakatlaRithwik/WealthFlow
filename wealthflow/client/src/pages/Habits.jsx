import React, { useEffect, useState } from 'react';
import { Plus, Flame, CheckCircle2, ListChecks, Pencil } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { fetchHabits, createHabit, updateHabit, completeHabit, deleteHabit } from '../services/habits.service';

const empty = { title: '', description: '', frequency: 'daily', category: 'General', targetValue: 1, reminderTime: '20:00', startDate: new Date().toISOString().slice(0, 10) };

export default function Habits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => { setLoading(true); fetchHabits().then((d) => setItems(d.items)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (h) => { setEditing(h); setForm({ title: h.title, frequency: h.frequency, category: h.category, reminderTime: h.reminderTime || '20:00' }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) await updateHabit(editing._id, form);
    else await createHabit(form);
    setModalOpen(false);
    setForm(empty);
    setEditing(null);
    load();
  };

  const markDone = async (id) => { await completeHabit(id); load(); };
  const remove = async (id) => { if (confirm('Delete this habit and its history?')) { await deleteHabit(id); load(); } };

  return (
    <AppLayout title="Habits">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-300">Consistency compounds. Track the behaviors, not just the balance.</p>
        <button onClick={openCreate} className="btn-lift inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {!loading && items.length === 0 && (
        <EmptyState icon={ListChecks} title="No habits yet" description="Create a habit like 'Track expenses daily' to start building your streak." actionLabel="+ New Habit" onAction={openCreate} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((h) => (
          <div key={h._id} className="card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-ink-700">{h.title}</h3>
                <p className="text-xs text-ink-300 mt-0.5 capitalize">{h.frequency} · {h.category}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold">
                <Flame size={16} /> {h.currentStreak}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-ink-300">
              <span>Longest streak: {h.longestStreak}</span>
              <span>{h.completionRate}% completion</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => markDone(h._id)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-growth-100 text-growth-600 text-sm font-medium hover:bg-growth/20 transition-colors focus-ring">
                <CheckCircle2 size={15} /> Mark done
              </button>
              <button onClick={() => openEdit(h)} className="p-2 rounded-lg border border-ink/[0.12] text-ink-500 hover:bg-ink/[0.04] transition-colors focus-ring" aria-label="Edit habit">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(h._id)} className="px-3 py-2 rounded-lg border border-ink/[0.12] text-sm text-ink-500 hover:bg-rust-100 hover:text-rust hover:border-rust/30 transition-colors focus-ring">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(empty); setEditing(null); }} title={editing ? 'Edit habit' : 'New habit'}>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Habit title (e.g. Save ₹100 every day)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field" />
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            className="input-field">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input placeholder="Category (e.g. Saving, Tracking, Investing)" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field" />
          <input type="time" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
            className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
            {editing ? 'Save changes' : 'Create habit'}
          </button>
        </form>
      </Modal>
    </AppLayout>
  );
}
