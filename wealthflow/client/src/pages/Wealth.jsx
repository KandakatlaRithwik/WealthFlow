import React, { useEffect, useState } from 'react';
import { Plus, PiggyBank } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import KpiCard from '../components/KpiCard';
import { useAuth } from '../context/AuthContext';
import { fetchWealth, addAsset, addLiability, addInvestment, deleteAsset, deleteLiability, deleteInvestment } from '../services/wealth.service';
import { formatCurrency } from '../utils/format';

const ASSET_TYPES = ['Cash', 'Savings Account', 'Fixed Deposit', 'Mutual Funds', 'Stocks', 'Gold', 'Property', 'Other'];
const LIABILITY_TYPES = ['Loan', 'Credit Card Balance', 'Education Loan', 'Other'];
const INVESTMENT_TYPES = ['Mutual Fund', 'Stocks', 'FD', 'Gold', 'Other'];

export default function Wealth() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null); // 'asset' | 'liability' | 'investment'
  const [form, setForm] = useState({});

  const load = () => fetchWealth().then(setData);
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (modal === 'asset') await addAsset({ ...form, currentValue: Number(form.currentValue), purchaseValue: Number(form.purchaseValue || 0) });
    if (modal === 'liability') await addLiability({ ...form, outstandingAmount: Number(form.outstandingAmount), interestRate: Number(form.interestRate || 0) });
    if (modal === 'investment') await addInvestment({ ...form, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue) });
    setModal(null); setForm({});
    load();
  };

  if (!data) return <AppLayout title="Wealth"><p className="text-sm text-ink-300">Loading…</p></AppLayout>;

  const currency = user?.currency;
  const hasAny = data.assets.length || data.liabilities.length || data.investments.length;

  return (
    <AppLayout title="Wealth">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Assets" value={formatCurrency(data.totals.totalAssets, currency)} icon={PiggyBank} />
        <KpiCard label="Total Liabilities" value={formatCurrency(data.totals.totalLiabilities, currency)} icon={PiggyBank} />
        <KpiCard label="Net Worth" value={formatCurrency(data.totals.netWorth, currency)} icon={PiggyBank} />
      </div>

      {!hasAny && (
        <EmptyState icon={PiggyBank} title="No wealth data yet" description="Add assets, liabilities, or investments to see your net worth." actionLabel="+ Add Asset" onAction={() => setModal('asset')} />
      )}

      {hasAny && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Section title="Assets" onAdd={() => setModal('asset')}>
            {data.assets.map((a) => (
              <Row key={a._id} name={a.name} sub={a.type} value={formatCurrency(a.currentValue, currency)} onDelete={() => deleteAsset(a._id).then(load)} />
            ))}
          </Section>
          <Section title="Liabilities" onAdd={() => setModal('liability')}>
            {data.liabilities.map((l) => (
              <Row key={l._id} name={l.name} sub={l.type} value={formatCurrency(l.outstandingAmount, currency)} negative onDelete={() => deleteLiability(l._id).then(load)} />
            ))}
          </Section>
          <Section title="Investments" onAdd={() => setModal('investment')}>
            {data.investments.map((i) => (
              <Row key={i._id} name={i.name} sub={`${i.type} · ${i.returnPct >= 0 ? '+' : ''}${i.returnPct}%`} value={formatCurrency(i.currentValue, currency)} onDelete={() => deleteInvestment(i._id).then(load)} />
            ))}
          </Section>
        </div>
      )}
      <p className="text-xs text-ink-300 mt-4">Manual tracking only — WealthFlow does not execute trades or connect to brokerage accounts.</p>

      <Modal open={modal === 'asset'} onClose={() => { setModal(null); setForm({}); }} title="Add asset">
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <select required onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="">Type</option>{ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" required placeholder="Current value" onChange={(e) => setForm({ ...form, currentValue: e.target.value })} className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Add asset</button>
        </form>
      </Modal>

      <Modal open={modal === 'liability'} onClose={() => { setModal(null); setForm({}); }} title="Add liability">
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <select required onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="">Type</option>{LIABILITY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" required placeholder="Outstanding amount" onChange={(e) => setForm({ ...form, outstandingAmount: e.target.value })} className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Add liability</button>
        </form>
      </Modal>

      <Modal open={modal === 'investment'} onClose={() => { setModal(null); setForm({}); }} title="Add investment">
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <select required onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="">Type</option>{INVESTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" required placeholder="Invested amount" onChange={(e) => setForm({ ...form, investedAmount: e.target.value })} className="input-field" />
          <input type="number" required placeholder="Current value" onChange={(e) => setForm({ ...form, currentValue: e.target.value })} className="input-field" />
          <button className="btn-lift w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow hover:shadow-xl focus-ring">Add investment</button>
        </form>
      </Modal>
    </AppLayout>
  );
}

function Section({ title, onAdd, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-700">{title}</h3>
        <button onClick={onAdd} className="p-1.5 rounded-lg hover:bg-ink/[0.06] focus-ring"><Plus size={16} /></button>
      </div>
      <div className="divide-y divide-ink/[0.06]">{children}</div>
    </div>
  );
}

function Row({ name, sub, value, negative, onDelete }) {
  return (
    <div className="flex items-center justify-between py-2.5 group">
      <div>
        <p className="text-sm text-ink-700">{name}</p>
        <p className="text-xs text-ink-300">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm num font-medium ${negative ? 'text-rust' : 'text-ink-700'}`}>{value}</span>
        <button onClick={onDelete} className="text-xs text-ink-300 opacity-0 group-hover:opacity-100 hover:text-rust">✕</button>
      </div>
    </div>
  );
}
