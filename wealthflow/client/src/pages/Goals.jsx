import React, { useEffect, useState } from 'react';
import { Plus, Target, Pencil } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { fetchGoals, createGoal, updateGoal, contributeToGoal, deleteGoal } from '../services/goals.service';
import { formatCurrency, formatDate } from '../utils/format';

const emptyGoal = { name: '', category: 'General Savings', targetAmount: '', targetDate: '', priority: 'medium' };

export default function Goals() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contribModal, setContribModal] = useState(null);
  const [form, setForm] = useState(emptyGoal);
  const [contribAmount, setContribAmount] = useState('');

  const load = () => { setLoading(true); fetchGoals().then((d) => setItems(d.items)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyGoal); setModalOpen(true); };
  const openEdit = (g) => {
    setEditing(g);
    setForm({ name: g.name, category: g.category, targetAmount: g.targetAmount, targetDate: g.targetDate ? g.targetDate.slice(0, 10) : '', priority: g.priority });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, targetAmount: Number(form.targetAmount) };
    if (editing) await updateGoal(editing._id, payload);
    else await createGoal(payload);
    setModalOpen(false);
    setForm(emptyGoal);
    setEditing(null);
    load();
  };

  const contribute = async (e) => {
    e.preventDefault();
    await contributeToGoal(contribModal._id, { amount: Number(contribAmount) });
    setContribModal(null);
    setContribAmount('');
    load();
  };

  const remove = async (id) => { if (confirm('Delete this goal?')) { await deleteGoal(id); load(); } };

  return (
    <AppLayout title="Savings Goals">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-300">Give every rupee a destination.</p>
        <button onClick={openCreate} className="btn-lift inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {!loading && items.length === 0 && (
        <EmptyState icon={Target} title="No goals yet" description="Create a goal like an Emergency Fund or a Laptop to start tracking progress." actionLabel="+ New Goal" onAction={openCreate} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((g) => (
          <div key={g._id} className="card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-ink-700">{g.name}</h3>
                <p className="text-xs text-ink-300 capitalize">{g.priority} priority · {g.category}</p>
              </div>
              <span className="text-sm font-semibold num text-growth">{g.percentage}%</span>
            </div>
            <ProgressBar percentage={g.percentage} />
            <p className="text-xs text-ink-500 mt-2 num">{formatCurrency(g.currentAmount, user?.currency)} / {formatCurrency(g.targetAmount, user?.currency)}</p>
            {g.targetDate && <p className="text-xs text-ink-300 mt-1">Target: {formatDate(g.targetDate)}</p>}
            {g.suggestedMonthlyContribution > 0 && g.status === 'active' && (
              <p className="text-xs text-ink-300 mt-1">Suggested: {formatCurrency(g.suggestedMonthlyContribution, user?.currency)}/mo</p>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setContribModal(g)} className="flex-1 py-2 rounded-lg bg-growth-100 text-growth-600 text-sm font-medium hover:bg-growth/20 transition-colors focus-ring">Add contribution</button>
              <button onClick={() => openEdit(g)} className="p-2 rounded-lg border border-ink/[0.12] text-ink-500 hover:bg-ink/[0.04] transition-colors focus-ring" aria-label="Edit goal">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(g._id)} className="px-3 py-2 rounded-lg border border-ink/[0.12] text-sm text-ink-500 hover:bg-rust-100 hover:text-rust hover:border-rust/30 transition-colors focus-ring">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyGoal); setEditing(null); }} title={editing ? 'Edit goal' : 'New savings goal'}>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Goal name (e.g. Emergency Fund)" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field" />
          <input type="number" required placeholder="Target amount" value={form.targetAmount}
            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            className="input-field" />
          <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="input-field" />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="input-field">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
            {editing ? 'Save changes' : 'Create goal'}
          </button>
        </form>
      </Modal>

      <Modal open={!!contribModal} onClose={() => { setContribModal(null); setContribAmount(''); }} title={`Contribute to ${contribModal?.name || ''}`}>
        <form onSubmit={contribute} className="space-y-3">
          <input type="number" required autoFocus placeholder="Amount" value={contribAmount}
            onChange={(e) => setContribAmount(e.target.value)}
            className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Add contribution</button>
        </form>
      </Modal>
    </AppLayout>
  );
}
