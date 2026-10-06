import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, ArrowLeftRight } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonRow } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transactions.service';
import { formatCurrency, formatDate } from '../utils/format';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Rent/Housing', 'Utilities', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Bills', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Scholarship', 'Interest', 'Gift', 'Other'];

const empty = { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), paymentMethod: 'Card' };

export default function Transactions() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    fetchTransactions(filters).then((d) => setItems(d.items)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters.type, filters.category]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t, date: t.date.slice(0, 10) }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editing) await updateTransaction(editing._id, payload);
    else await createTransaction(payload);
    setModalOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this transaction? This cannot be undone.')) return;
    await deleteTransaction(id);
    load();
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <AppLayout title="Transactions">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="input-field w-auto min-w-[9rem]">
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            placeholder="Search description…" value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input-field w-52"
          />
        </div>
        <button onClick={openCreate} className="btn-lift inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-4">{[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions yet" description="Add your first income or expense to get started." actionLabel="+ Add Transaction" onAction={openCreate} />
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-ink-300 border-b border-ink/[0.07]">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} className="border-b border-ink/[0.05] last:border-0 hover:bg-brand/[0.04] transition-colors duration-150">
                  <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-ink-700">{t.description || '—'}</td>
                  <td className="px-4 py-3 text-ink-500">{t.category}</td>
                  <td className="px-4 py-3 text-ink-500">{t.paymentMethod}</td>
                  <td className={`px-4 py-3 text-right num font-medium ${t.type === 'income' ? 'text-growth' : 'text-rust'}`}>
                    {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount, user?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-ink/[0.06] focus-ring"><Pencil size={15} /></button>
                      <button onClick={() => remove(t._id)} className="p-1.5 rounded-lg hover:bg-rust-100 text-rust focus-ring"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit transaction' : 'Add transaction'}>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-2">
            {['expense', 'income'].map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, type: t, category: '' })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border ${form.type === t ? 'bg-ink-700 text-paper-100 border-ink-700' : 'border-ink/[0.12] text-ink-500'}`}>
                {t}
              </button>
            ))}
          </div>
          <input type="number" step="0.01" required placeholder="Amount" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input-field" />
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field" />
          <input type="date" required value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field" />
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="input-field">
            {['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </form>
      </Modal>
    </AppLayout>
  );
}
