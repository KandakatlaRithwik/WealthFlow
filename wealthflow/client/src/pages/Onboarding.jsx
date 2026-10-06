import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { addAsset } from '../services/wealth.service';

const STEPS = ['Income', 'Goal', 'Savings target', 'Currency', 'Starting point'];

export default function Onboarding() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    monthlyIncomeTarget: '', primaryFinancialGoal: '', monthlySavingsTarget: '',
    currency: 'INR', initialSavings: '',
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    const { data } = await api.put('/profile', {
      monthlyIncomeTarget: Number(form.monthlyIncomeTarget) || 0,
      primaryFinancialGoal: form.primaryFinancialGoal,
      monthlySavingsTarget: Number(form.monthlySavingsTarget) || 0,
      currency: form.currency,
      onboardingCompleted: true,
    });
    setUser(data.user);
    localStorage.setItem('wf_user', JSON.stringify(data.user));

    if (Number(form.initialSavings) > 0) {
      await addAsset({ name: 'Starting Savings', type: 'Savings Account', currentValue: Number(form.initialSavings), purchaseValue: Number(form.initialSavings) });
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <div className="w-full max-w-md card p-8">
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'gradient-brand' : 'bg-ink/[0.08]'}`} />)}
        </div>

        <h2 className="text-xl font-display italic text-ink-700 mb-1">{STEPS[step]}</h2>
        <p className="text-sm text-ink-300 mb-6">Step {step + 1} of {STEPS.length} — you can change this anytime in Settings.</p>

        {step === 0 && (
          <input type="number" autoFocus placeholder="Monthly income (₹)" value={form.monthlyIncomeTarget}
            onChange={(e) => setForm({ ...form, monthlyIncomeTarget: e.target.value })}
            className="input-field" />
        )}
        {step === 1 && (
          <textarea autoFocus placeholder="e.g. Build a 6-month emergency fund" value={form.primaryFinancialGoal}
            onChange={(e) => setForm({ ...form, primaryFinancialGoal: e.target.value })} rows={3}
            className="input-field" />
        )}
        {step === 2 && (
          <input type="number" autoFocus placeholder="Monthly savings target (₹)" value={form.monthlySavingsTarget}
            onChange={(e) => setForm({ ...form, monthlySavingsTarget: e.target.value })}
            className="input-field" />
        )}
        {step === 3 && (
          <select autoFocus value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="input-field">
            {['INR', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}
          </select>
        )}
        {step === 4 && (
          <input type="number" autoFocus placeholder="Current savings, optional (₹)" value={form.initialSavings}
            onChange={(e) => setForm({ ...form, initialSavings: e.target.value })}
            className="input-field" />
        )}

        <div className="flex gap-2 mt-6">
          {step > 0 && <button onClick={back} className="flex-1 py-2.5 rounded-xl border border-ink/[0.12] text-sm font-medium text-ink-500 hover:bg-ink/[0.04] transition-colors focus-ring">Back</button>}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow focus-ring">Next</button>
          ) : (
            <button onClick={finish} className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium shadow-glow focus-ring">Finish</button>
          )}
        </div>
        <button onClick={() => navigate('/dashboard')} className="w-full text-center text-xs text-ink-300 mt-4 hover:underline">Skip for now</button>
      </div>
    </div>
  );
}
